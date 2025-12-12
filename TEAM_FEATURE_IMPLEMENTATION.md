# 팀 기능 및 WebSocket 실시간 동기화 구현 정리

## 📋 개요
일정(Schedule)을 개인 일정에서 팀 일정으로 전환할 수 있는 기능과, 팀 일정의 실시간 동기화를 위한 WebSocket 기능을 구현했습니다.

---

## 🗄️ 백엔드 변경사항

### 1. 데이터베이스 스키마 확장

#### 새 테이블 추가
- **`teams`**: 팀 정보
  - `id` (PK)
  - `name` (팀 이름)
  - `ownerId` (FK → users.id)
  - `createdAt`, `updatedAt`

- **`team_users`**: 팀-사용자 관계 (다대다)
  - `id` (PK)
  - `teamId` (FK → teams.id)
  - `userId` (FK → users.id)
  - `role` (OWNER | ADMIN | MEMBER)
  - `status` (ACTIVE | PENDING | REJECTED)
  - `createdAt`, `updatedAt`

#### 기존 테이블 수정
- **`schedules`**: `teamId` 컬럼 추가 (nullable FK → teams.id)
  - 개인 일정: `teamId = null`
  - 팀 일정: `teamId = 팀 ID`

#### 마이그레이션 파일
- `apps/goalDiaryBack/src/migrations/1770000000000-AddTeamEntities.ts`
- 모든 마이그레이션 파일은 `src/migrations/` 폴더로 정리

---

### 2. 엔티티 및 모듈

#### 새 엔티티
- `apps/goalDiaryBack/src/team/entities/team.entity.ts`
- `apps/goalDiaryBack/src/team/entities/team-user.entity.ts`

#### 엔티티 관계
- `User` ↔ `TeamUser` (1:N)
- `Team` ↔ `TeamUser` (1:N)
- `Schedule` → `Team` (N:1, nullable)
- `Schedule` ↔ `ScheduleUser` (기존 다대다 유지)

#### 모듈
- `TeamModule`: 팀 관련 기능 모듈
- `ScheduleModule`: `TeamModule` import 추가

---

### 3. API 엔드포인트

#### 팀 관련 API (`/teams`)
- `POST /teams`: 팀 생성
  - Body: `{ name: string }`
  - 인증: JWT (ownerId는 자동으로 현재 사용자)

- `POST /teams/:teamId/invite`: 팀 멤버 초대
  - Body: `{ userId: string }`
  - 초대 상태: `PENDING`

- `PATCH /teams/invitations/:membershipId`: 초대 수락/거절
  - Body: `{ status: "ACTIVE" | "REJECTED" }`

- `GET /teams/:teamId/members`: 팀 멤버 목록 조회

- `GET /teams/:teamId`: 팀 정보 조회

#### 스케줄 관련 API (`/schedules`)
- `PATCH /schedules/:scheduleId/convert-to-team`: 일정을 팀 일정으로 전환
  - Body: `{ teamName: string }`
  - 동작: 팀 이름으로 팀 찾기 → 없으면 생성 → schedule.teamId 업데이트

---

### 4. 서비스 로직

#### `TeamService`
- `createTeam()`: 팀 생성
- `inviteMember()`: 팀 멤버 초대
- `updateInvitationStatus()`: 초대 상태 변경
- `listMembers()`: 팀 멤버 목록
- `getTeam()`: 팀 정보 조회
- **`findOrCreateTeamByName()`**: 팀 이름으로 찾거나 생성 (새로 추가)

#### `ScheduleService`
- `create()`: 개인 일정으로만 생성 (teamId 제거)
- `updateByScheduleId()`: teamId 관련 코드 제거
- **`convertToTeam()`**: 일정을 팀 일정으로 전환 (새로 추가)
  - 권한 체크 (canEdit = true)
  - 팀 찾기/생성
  - schedule.teamId 업데이트
  - WebSocket 브로드캐스트

---

### 5. WebSocket 구현

#### `ScheduleGateway` (`/schedules` namespace)
- **인증**: JWT 토큰 검증 (handshake 시)
  - `Authorization: Bearer <token>` 또는 query `token`
  - `JWT_ACCESS_SECRET` 사용 (ConfigService)

- **이벤트**:
  - `joinSchedule`: 클라이언트가 `schedule:{scheduleId}` room에 join
  - `schedule.updated`: 서버가 브로드캐스트 (생성/수정/삭제 시)

- **브로드캐스트**:
  - `ScheduleService`에서 스케줄 변경 시 `scheduleGateway.emitScheduleUpdated()` 호출
  - 해당 `schedule:{scheduleId}` room의 모든 클라이언트에게 전송

#### 의존성 추가
- `@nestjs/websockets`
- `@nestjs/platform-socket.io`
- `socket.io`

---

## 🎨 프론트엔드 변경사항

### 1. 타입 정의

#### `ScheduleType.ts`
```typescript
export type GetSchedulesType = {
    id: string;
    title: string;
    startDate: string;
    endDate?: string;
    teamId?: number;
    team?: {
        id: number;
        name: string;
    };
};
```

---

### 2. API 함수 및 React Query 훅

#### `schedulesApi.ts`
- `convertScheduleToTeam()`: 팀으로 전환 API 호출

#### `useSchedules.tsx`
- `useConvertScheduleToTeam()`: 팀으로 전환 mutation hook

---

### 3. UI 컴포넌트

#### `ConvertToTeamModal.tsx` (새로 추가)
- 팀 이름 입력 모달
- 일정을 팀 일정으로 전환하는 UI

#### `ScheduleListItem.tsx` (수정)
- **팀 뱃지 표시**: 팀 일정인 경우 팀 이름 표시
- **"팀으로 전환" 버튼**: 개인 일정인 경우에만 표시 (Users 아이콘)
- `ConvertToTeamModal` 연동

---

### 4. WebSocket 연결

#### `useScheduleWebSocket.tsx` (새로 추가)
- Socket.IO 클라이언트 연결
- `scheduleId`로 `schedule:{scheduleId}` room join
- `schedule.updated` 이벤트 수신 시 React Query 캐시 갱신

#### `DndBoard.tsx` (수정)
- `useScheduleWebSocket(scheduleId)` 훅 추가
- 스케줄 상세 페이지에서 자동으로 WebSocket 연결

#### 의존성 추가
- `socket.io-client`

---

## 🔄 동작 흐름

### 1. 일정을 팀 일정으로 전환
1. 사용자가 일정 목록에서 "팀으로 전환" 버튼 클릭
2. `ConvertToTeamModal` 열림
3. 팀 이름 입력 후 "전환" 클릭
4. `PATCH /schedules/:id/convert-to-team` API 호출
5. 백엔드에서:
   - 팀 이름으로 팀 찾기 (없으면 생성)
   - `schedule.teamId` 업데이트
   - WebSocket으로 `schedule.updated` 브로드캐스트
6. 프론트에서 React Query 캐시 갱신 → UI 업데이트

### 2. 실시간 동기화 (WebSocket)
1. 사용자가 스케줄 상세 페이지(`DndBoard`) 접속
2. `useScheduleWebSocket(scheduleId)` 훅이 자동으로 WebSocket 연결
3. JWT 토큰으로 인증 후 `schedule:{scheduleId}` room에 join
4. 다른 사용자가 스케줄을 수정/삭제하면:
   - 백엔드에서 `schedule.updated` 이벤트 브로드캐스트
   - 모든 연결된 클라이언트가 이벤트 수신
   - React Query 캐시 자동 갱신 → UI 즉시 반영

---

## 📝 주요 설계 결정

### 1. 일정 생성 시 teamId를 받지 않는 이유
- 사용자 요구사항: "일정을 만들고 나서 팀으로 사용해야겠다 할 때 바꾸는 게 자연스럽다"
- 따라서 일정 생성은 항상 개인 일정으로 생성
- 나중에 "팀으로 전환" 버튼으로 팀 일정으로 변경

### 2. 팀 이름으로 팀 찾기/생성
- `findOrCreateTeamByName()`: 팀 이름이 있으면 기존 팀 사용, 없으면 생성
- 팀 이름 중복 가능 (같은 이름의 팀이 여러 개 있을 수 있음)
- 추후 팀 선택 UI로 개선 가능

### 3. WebSocket 룸 전략
- `schedule:{scheduleId}`: 스케줄 단위로 room 분리
- 팀 일정도 `schedule:{scheduleId}` room 사용 (팀 ID가 아닌 스케줄 ID 기준)
- 추후 팀 단위 룸(`team:{teamId}`) 추가 가능

### 4. 개인 일정 vs 팀 일정
- **개인 일정** (`teamId = null`): HTTP만 사용 (WebSocket 연결 안 함)
- **팀 일정** (`teamId != null`): WebSocket으로 실시간 동기화
- 프론트에서 `schedule.team` 존재 여부로 판단

---

## 🚀 다음 단계 (선택사항)

1. **팀 선택 UI 개선**
   - 팀 이름 입력 대신 기존 팀 목록에서 선택
   - 팀 검색 기능

2. **WebSocket 권한 체크 강화**
   - `joinSchedule` 시 schedule 참여자/팀 멤버 검증
   - 현재는 TODO 상태

3. **팀 단위 WebSocket 룸**
   - `team:{teamId}` room 추가
   - 팀의 모든 일정 변경사항을 한 번에 브로드캐스트

4. **초대 수락/거절 UI**
   - 프론트에서 초대 목록 표시
   - 수락/거절 버튼

---

## 📦 설치 및 실행

### 백엔드
```bash
cd apps/goalDiaryBack
pnpm install
pnpm migration:run  # 마이그레이션 실행
pnpm dev
```

### 프론트엔드
```bash
cd apps/goalDiaryFront
pnpm install  # socket.io-client 설치
pnpm dev
```

---

## ✅ 완료된 작업

- [x] DB 스키마 확장 (teams, team_users, schedule.teamId)
- [x] 엔티티 및 모듈 추가
- [x] 팀 생성/초대/수락 API 구현
- [x] 일정을 팀 일정으로 전환 API 구현
- [x] WebSocket Gateway 구현
- [x] 프론트 "팀으로 전환" UI 구현
- [x] 프론트 WebSocket 연결 및 실시간 동기화

---

## 📚 참고 파일

### 백엔드
- `apps/goalDiaryBack/src/team/` (팀 관련 모든 파일)
- `apps/goalDiaryBack/src/schedule/schedule.gateway.ts`
- `apps/goalDiaryBack/src/schedule/schedule.service.ts` (convertToTeam 메서드)
- `apps/goalDiaryBack/src/migrations/1770000000000-AddTeamEntities.ts`

### 프론트엔드
- `apps/goalDiaryFront/src/app/components/main/modal/ConvertToTeamModal.tsx`
- `apps/goalDiaryFront/src/app/components/main/ScheduleListItem.tsx`
- `apps/goalDiaryFront/src/app/hooks/useScheduleWebSocket.tsx`
- `apps/goalDiaryFront/src/app/components/DndBoard.tsx`

---

**작성일**: 2025-01-08
**작성자**: AI Assistant

