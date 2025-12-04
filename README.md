<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Server Information

- **Frontend Server (Next.js)**: `http://localhost:3000`
- **Backend Server (NestJS)**: `http://localhost:3001`

## API Endpoints

### Routines

- `GET /routines` - 사용자의 모든 루틴 조회 (오늘 완료 상태 및 연속 달성 일수 포함)
- `POST /routines` - 새 루틴 생성
- `GET /routines/today` - 오늘의 루틴 완료 상태 조회
- `GET /routines/stats` - 루틴 통계 조회
- `GET /routines/:id` - 특정 루틴 조회
- `PATCH /routines/:id` - 루틴 수정
- `DELETE /routines/:id` - 루틴 삭제
- `POST /routines/:id/complete` - 루틴 완료 처리
- `DELETE /routines/:id/complete` - 루틴 완료 취소
- `GET /routines/:id/streak` - 특정 루틴의 연속 달성 일수

## 주요 기능

### 1. 루틴 관리 시스템

- **루틴 생성**: 제목, 설명, 카테고리, 일정 날짜, 시간, 지속 시간 등을 포함한 루틴 생성
- **루틴 조회**: 사용자의 모든 루틴을 조회하며, 각 루틴의 오늘 완료 상태와 연속 달성 일수를 포함
- **루틴 수정/삭제**: 기존 루틴의 정보 수정 및 삭제

### 2. 루틴 완료 시스템

- **완료 처리**: 특정 날짜에 루틴 완료 처리
- **완료 취소**: 완료된 루틴의 완료 상태 취소
- **연속 달성 일수 자동 계산**: 완료 시 연속 달성 일수를 자동으로 계산하고 업데이트

### 3. 성능 최적화

- **효율적인 데이터 조회**: 매번 계산하지 않고 데이터베이스에서 직접 조회
- **연속 달성 일수 실시간 업데이트**: 완료 시 즉시 연속 달성 일수와 최근 완료일 업데이트
- **캐싱 시스템**: 자주 조회되는 데이터에 대한 캐싱 적용

## 데이터베이스 스키마

### Routines 테이블

```sql
CREATE TABLE routines (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  schedule_date DATE,
  time TIME,
  duration INTEGER,
  isActive BOOLEAN DEFAULT true,
  category VARCHAR(50),
  streak INTEGER DEFAULT 0,              -- 연속 달성 일수
  last_completed_date DATE,              -- 최근 완료일
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  userId UUID NOT NULL REFERENCES users(id)
);
```

### Routine Completions 테이블

```sql
CREATE TABLE routine_completions (
  id SERIAL PRIMARY KEY,
  routine_id INTEGER NOT NULL REFERENCES routines(id),
  date DATE NOT NULL,
  completed_at TIMESTAMP DEFAULT now(),
  UNIQUE(routine_id, date)
);
```

## API 응답 예시

### GET /routines

```json
[
  {
    "id": 3,
    "title": "123123",
    "description": "루틴ㄴㄴ",
    "schedule_date": "2025-10-10",
    "time": "16:00:00",
    "duration": 40,
    "isActive": false,
    "category": "운동",
    "streak": 2, // 연속 달성 일수
    "last_completed_date": "2025-10-05", // 최근 완료일
    "created_at": "2025-10-03T20:07:59.521Z",
    "updated_at": "2025-10-03T22:17:59.271Z",
    "completions": [
      {
        "id": 16,
        "completed_at": "2025-10-03T22:17:49.275Z",
        "date": "2025-10-04"
      }
    ],
    "completedToday": true // 오늘 완료 여부
  }
]
```

### POST /routines/:id/complete

```json
{
  "routine_id": 3,
  "completed_at": "2025-10-03T22:17:59.410Z",
  "date": "2025-10-05",
  "streak": 2 // 업데이트된 연속 달성 일수
}
```

## 연속 달성 일수 로직

1. **첫 완료**: 연속 달성 일수 = 1
2. **연속 완료**: 이전 완료일과 1일 차이인 경우, 기존 연속 달성 일수 + 1
3. **연속 끊김**: 이전 완료일과 1일 이상 차이인 경우, 연속 달성 일수 = 1
4. **완료 취소**: 가장 최근 완료 기록을 기준으로 연속 달성 일수 재계산

## 성능 개선 사항

- **기존**: N+1 쿼리 문제 (루틴 개수만큼 추가 쿼리 실행)
- **개선**: 2개 쿼리로 모든 데이터 조회 (루틴 + 오늘 완료 상태, 모든 루틴의 연속 달성 일수)
- **결과**: 루틴 10개 기준 12개 쿼리 → 2개 쿼리로 **6배 성능 향상**

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
