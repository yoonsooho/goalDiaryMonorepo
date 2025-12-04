# API 및 Hook 생성 표준

이 문서는 프로젝트에서 API 파일과 React Query 훅을 생성할 때 따라야 하는 표준을 정의합니다.

## 0. UI 컴포넌트 사용 가이드

### 사용 가능한 UI 컴포넌트

프로젝트에서 사용할 수 있는 UI 컴포넌트들은 `src/components/ui/` 폴더에 위치합니다.

#### 주요 컴포넌트들

-   **Confirm Modal**: `src/components/ui/confirm-modal.tsx` - 확인/취소 다이얼로그 (권장)
-   **Alert Dialog**: `src/components/ui/alert-dialog.tsx` - 확인/취소 다이얼로그 (기본)
-   **Button**: `src/components/ui/button.tsx` - 버튼 컴포넌트
-   **Card**: `src/components/ui/card.tsx` - 카드 컴포넌트
-   **Dialog**: `src/components/ui/dialog.tsx` - 모달 다이얼로그
-   **Input**: `src/components/ui/input.tsx` - 입력 필드
-   **Label**: `src/components/ui/label.tsx` - 라벨 컴포넌트
-   **Toast**: `src/components/ui/toast.tsx` - 토스트 알림

#### Confirm Modal 사용 예시 (권장)

```typescript
import { ConfirmModal, useConfirmModal } from "@/components/ui/confirm-modal";

// 방법 1: useConfirmModal 훅 사용 (권장)
const MyComponent = () => {
    const { openConfirm, ConfirmModal } = useConfirmModal();

    const handleDelete = () => {
        // 삭제 로직
    };

    return (
        <>
            <Button
                variant="destructive"
                onClick={() =>
                    openConfirm(handleDelete, {
                        title: "정말 삭제하시겠습니까?",
                        description: "이 작업은 되돌릴 수 없습니다.",
                        confirmText: "삭제",
                        cancelText: "취소",
                        variant: "destructive",
                    })
                }
            >
                삭제
            </Button>
            <ConfirmModal />
        </>
    );
};

// 방법 2: 직접 사용
const MyComponent2 = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>삭제</Button>
            <ConfirmModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={handleDelete}
                title="정말 삭제하시겠습니까?"
                description="이 작업은 되돌릴 수 없습니다."
                confirmText="삭제"
                cancelText="취소"
                variant="destructive"
            />
        </>
    );
};
```

#### Dialog 사용 예시

```typescript
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// 모달 다이얼로그
<Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>제목</DialogTitle>
            <DialogDescription>설명</DialogDescription>
        </DialogHeader>
        <DialogFooter>
            <Button onClick={handleSubmit}>확인</Button>
        </DialogFooter>
    </DialogContent>
</Dialog>;
```

## 1. API 파일 생성 (`src/api/`)

### 파일 명명 규칙

-   API 경로를 기반으로 파일명을 결정
-   예: `/routines` → `routineApi.ts`
-   예: `/schedules` → `schedulesApi.ts`
-   예: `/users` → `userApi.ts`

### API 함수 구조

```typescript
import { commonApiJson } from "@/api/commonApi";
import { CreateDto, UpdateDto, EntityType } from "@/type/EntityType";

// 조회 (전체)
export const getEntities = async () => {
    return await commonApiJson("/api/entities", {
        method: "GET",
        requireAuth: true,
    });
};

// 조회 (단일)
export const getEntity = async (id: string) => {
    return await commonApiJson(`/api/entities/${id}`, {
        method: "GET",
        requireAuth: true,
    });
};

// 생성
export const createEntity = async (data: CreateDto) => {
    return await commonApiJson("/api/entities", {
        method: "POST",
        body: data,
        requireAuth: true,
    });
};

// 수정
export const updateEntity = async (data: EntityType) => {
    return await commonApiJson(`/api/entities/${data.id}`, {
        method: "PATCH",
        body: { ...data, id: undefined },
        requireAuth: true,
    });
};

// 삭제
export const deleteEntity = async (id: string) => {
    return await commonApiJson(`/api/entities/${id}`, {
        method: "DELETE",
        requireAuth: true,
    });
};
```

### API 함수 명명 규칙

-   `getEntities` - 전체 조회
-   `getEntity` - 단일 조회
-   `createEntity` - 생성
-   `updateEntity` - 수정
-   `deleteEntity` - 삭제

## 2. React Query 훅 생성 (`src/app/hooks/apiHook/`)

### 파일 명명 규칙

-   API 파일명을 기반으로 `use` 접두사 추가
-   예: `routineApi.ts` → `useRoutine.tsx`
-   예: `schedulesApi.ts` → `useSchedules.tsx`

### 훅 구조

```typescript
import { useMutation, useQuery } from "@tanstack/react-query";
import { getEntities, getEntity, createEntity, updateEntity, deleteEntity } from "@/api/entityApi";
import { CreateDto, EntityType } from "@/type/EntityType";

// 전체 조회
export const useGetEntities = () => {
    return useQuery({
        queryKey: ["entities"],
        queryFn: getEntities,
    });
};

// 단일 조회
export const useGetEntity = (id: string) => {
    return useQuery({
        queryKey: ["entity", id],
        queryFn: () => getEntity(id),
        enabled: !!id,
    });
};

// 생성
export const useCreateEntity = () => {
    return useMutation({
        mutationFn: (data: CreateDto) => {
            return createEntity(data);
        },
    });
};

// 수정
export const useUpdateEntity = () => {
    return useMutation({
        mutationFn: (data: EntityType) => {
            return updateEntity(data);
        },
    });
};

// 삭제
export const useDeleteEntity = () => {
    return useMutation({
        mutationFn: (id: string) => {
            return deleteEntity(id);
        },
    });
};
```

### 훅 명명 규칙

-   `useGetEntities` - 전체 조회
-   `useGetEntity` - 단일 조회
-   `useCreateEntity` - 생성
-   `useUpdateEntity` - 수정
-   `useDeleteEntity` - 삭제

## 3. 타입 정의 (`src/type/`)

### 파일 명명 규칙

-   엔티티명을 기반으로 `Type.ts` 접미사
-   예: `RoutineType.ts`, `ScheduleType.ts`

### 타입 구조

```typescript
// 생성 DTO
export type CreateEntityDto = {
    title: string;
    description?: string;
    // ... 기타 필드
};

// 전체 엔티티 타입
export type EntityType = {
    id: string;
    title: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    // ... 기타 필드
};
```

## 4. 컴포넌트에서 사용 예시

```typescript
import { useCreateEntity } from "@/app/hooks/apiHook/useEntity";
import { CreateEntityDto } from "@/type/EntityType";

const MyComponent = () => {
    const { mutate: createEntity } = useCreateEntity();

    const handleSubmit = (data: CreateEntityDto) => {
        createEntity(data, {
            onSuccess: () => {
                // 성공 처리
            },
            onError: (error) => {
                // 에러 처리
            },
        });
    };

    // ...
};
```

## 5. 체크리스트

새로운 API를 추가할 때 다음 사항들을 확인하세요:

-   [ ] `src/type/`에 타입 정의 파일 생성
-   [ ] `src/api/`에 API 함수 파일 생성
-   [ ] `src/app/hooks/apiHook/`에 React Query 훅 파일 생성
-   [ ] 모든 CRUD 작업에 대한 함수 구현
-   [ ] 적절한 에러 처리 및 인증 설정
-   [ ] 일관된 명명 규칙 적용
-   [ ] TypeScript 타입 안정성 확보
-   [ ] UI 컴포넌트는 `src/components/ui/`에서 가져와서 사용
-   [ ] 삭제 기능에는 `ConfirmModal` 사용하여 확인 절차 추가 (권장)

## 6. 예시: Routine API 구현

### 1. 타입 정의 (`src/type/RoutineType.ts`)

```typescript
export type CreateRoutineDto = {
    title: string;
    description?: string;
    schedule_date?: string;
    time?: string;
    duration?: number;
    isActive?: boolean;
    category?: string;
};

export type RoutineType = {
    id: string;
    title: string;
    description?: string;
    schedule_date?: string;
    time?: string;
    duration?: number;
    isActive?: boolean;
    category?: string;
    created_at?: string;
    updated_at?: string;
};
```

### 2. API 함수 (`src/api/routineApi.ts`)

```typescript
import { commonApiJson } from "@/api/commonApi";
import { CreateRoutineDto, RoutineType } from "@/type/RoutineType";

export const getRoutines = async () => {
    return await commonApiJson("/api/routines", {
        method: "GET",
        requireAuth: true,
    });
};

export const createRoutine = async (data: CreateRoutineDto) => {
    return await commonApiJson("/api/routines", {
        method: "POST",
        body: data,
        requireAuth: true,
    });
};

// ... 기타 CRUD 함수들
```

### 3. React Query 훅 (`src/app/hooks/apiHook/useRoutine.tsx`)

```typescript
import { useMutation, useQuery } from "@tanstack/react-query";
import { getRoutines, createRoutine } from "@/api/routineApi";
import { CreateRoutineDto } from "@/type/RoutineType";

export const useGetRoutines = () => {
    return useQuery({
        queryKey: ["routines"],
        queryFn: getRoutines,
    });
};

export const useCreateRoutine = () => {
    return useMutation({
        mutationFn: (data: CreateRoutineDto) => {
            return createRoutine(data);
        },
    });
};

// ... 기타 훅들
```

이 표준을 따라 일관성 있는 API 구조를 유지하세요.
