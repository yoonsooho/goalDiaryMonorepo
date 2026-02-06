# Refresh Token 설계 정리 (다중 기기 + 로테이션)

이 문서는 GoalDiary 백엔드의 **리프레시 토큰 저장/검증 방식**을 정리한 것입니다.

## 목표

- 웹, 모바일 등 **여러 기기에서 동시에 로그인해도 세션이 끊기지 않게** 한다.
- 각 기기는 **자기 전용 refresh 토큰 1개만** 가지고, `/auth/refresh` 호출 시
  - accessToken 재발급
  - refreshToken도 함께 새 값으로 교체(로테이션)
- 로그아웃하면 해당 유저의 refresh 토큰은 DB에서 삭제된다.

---

## 테이블 구조

### 1. User 엔티티

`apps/goalDiaryBack/src/users/users.entity.ts`

```ts
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({ nullable: true })
  password: string;

  // 기존: refreshToken 컬럼 존재했지만, 현재 구조에서는 사용하지 않음
  // @Column({ nullable: true })
  // refreshToken?: string;
}
```

### 2. UserRefreshToken 엔티티

`apps/goalDiaryBack/src/auth/entities/user-refresh-token.entity.ts`

```ts
@Entity({ name: 'user_refresh_tokens' })
export class UserRefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  tokenHash: string; // argon2로 해시된 refresh 토큰

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null; // 만료 시각 (예: 발급 시점 + 7일)
}
```

**핵심 포인트**

- `users.refreshToken` 대신 `user_refresh_tokens` 테이블에 여러 row를 저장할 수 있다.
- 한 row는 “특정 기기/세션의 refresh 토큰 1개”를 의미한다.
- `onDelete: 'CASCADE'` 덕분에 유저가 삭제되면 해당 유저의 refresh 토큰 row도 함께 삭제된다.

---

## AuthModule 설정

`apps/goalDiaryBack/src/auth/auth.module.ts`

```ts
@Module({
  imports: [
    JwtModule.register({}),
    UsersModule,
    TypeOrmModule.forFeature([UserRefreshToken]),
  ],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
```

`UserRefreshToken` 엔티티를 TypeORM에 등록해서, `AuthService`에서 `Repository<UserRefreshToken>`를 주입받아 사용할 수 있다.

---

## 동작 흐름

### 1. 로그인/회원가입/소셜 로그인 시

관련 메서드: `signUp`, `signIn`, `googleLogin`  
파일: `apps/goalDiaryBack/src/auth/auth.service.ts`

```ts
const tokens = await this.getTokens(user);
await this.updateRefreshToken(user.id, tokens.refreshToken);
return tokens;
```

`updateRefreshToken` 내부:

```ts
private async updateRefreshToken(userId: string, refreshToken: string) {
  const hashedRefreshToken = await this.hashFn(refreshToken);

  const expiresAt = new Date();
  // refresh 토큰 만료 시간: 현재 + 7일
  expiresAt.setDate(expiresAt.getDate() + 7);

  const tokenEntity = this.refreshTokenRepo.create({
    user: { id: userId } as User,
    tokenHash: hashedRefreshToken,
    expiresAt,
  });

  await this.refreshTokenRepo.save(tokenEntity);
}
```

**의미**

- 로그인/회원가입/소셜 로그인 할 때마다, 해당 세션(기기)에 대한 **새 refresh 토큰 row를 하나 추가**한다.
- 기존 다른 기기에서 쓰던 토큰 row는 그대로 두므로, 여러 기기에서 동시에 로그인 가능하다.

---

### 2. 로그아웃 (`signOut`)

```ts
async signOut(userId: string, refreshToken?: string) {
  // refreshToken이 없으면 특정 기기를 식별할 수 없으므로 아무것도 하지 않음
  // (전체 기기 로그아웃 방지 - 클라이언트는 로컬 토큰만 삭제)
  if (!refreshToken) {
    return;
  }

  // 특정 기기만 로그아웃: 해당 refresh token과 일치하는 row만 삭제
  const now = new Date();
  const activeTokens = await this.refreshTokenRepo.find({
    where: {
      user: { id: userId } as User,
      expiresAt: MoreThan(now),
    },
  });

  for (const tokenEntity of activeTokens) {
    const isMatch = await argon2.verify(tokenEntity.tokenHash, refreshToken);
    if (isMatch) {
      await this.refreshTokenRepo.delete({ id: tokenEntity.id });
      return;
    }
  }

  // 일치하는 토큰이 없으면 이미 삭제되었거나 만료된 토큰이므로 정상 처리
  // (사용자가 이미 로그아웃된 상태일 수 있음)
}
```

**의미**

- **특정 기기만 로그아웃**:
  - Request body나 쿠키에서 `refreshToken`을 받아서, 해당 토큰의 해시와 일치하는 row만 삭제
  - 다른 기기의 refresh 토큰은 그대로 유지되므로, 다른 기기에서는 계속 로그인 상태 유지
- **안전한 처리**:
  - `refreshToken`이 없으면 백엔드에서 아무것도 하지 않음 (전체 기기 로그아웃 방지)
  - 클라이언트는 로컬 토큰만 삭제하고 로그인 화면으로 이동
  - 백엔드 호출 실패해도 정상적으로 처리 (네트워크 오류 등 대비)

---

### 3. 토큰 재발급 (`/auth/refresh`)

관련 메서드: `refreshAllTokens`  
파일: `apps/goalDiaryBack/src/auth/auth.service.ts`

```ts
async refreshAllTokens(userId: string, refreshToken: string) {
  const user = await this.usersService.findById(userId);
  if (!user) {
    throw new ForbiddenException('사용자를 찾을 수 없습니다.');
  }

  // 1) 해당 유저의 활성화된(만료되지 않은) 토큰들 조회
  const now = new Date();
  const activeTokens = await this.refreshTokenRepo.find({
    where: {
      user: { id: userId } as User,
      expiresAt: MoreThan(now),
    },
    relations: ['user'],
  });

  if (!activeTokens || activeTokens.length === 0) {
    throw new ForbiddenException('refresh token이 존재하지 않습니다.');
  }

  // 2) 전달된 refreshToken과 해시가 일치하는 토큰 찾기
  let matchedToken: UserRefreshToken | null = null;
  for (const tokenEntity of activeTokens) {
    const isMatch = await argon2.verify(tokenEntity.tokenHash, refreshToken);
    if (isMatch) {
      matchedToken = tokenEntity;
      break;
    }
  }

  if (!matchedToken) {
    throw new ForbiddenException('refresh token이 일치하지 않습니다.');
  }

  // 3) 새 토큰 발급 (로테이션)
  const tokens = await this.getTokens(user);

  // 4) 기존 row에 새 refresh 토큰 해시와 만료 시간 업데이트 (기기별 1개 유지)
  const newHashed = await this.hashFn(tokens.refreshToken);
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + 7); // 7일 유효

  matchedToken.tokenHash = newHashed;
  matchedToken.expiresAt = newExpiresAt;
  await this.refreshTokenRepo.save(matchedToken);

  return tokens;
}
```

**의미**

1. 동일 유저의 만료되지 않은(refresh 유효기간 내) 토큰들만 가져온다.
2. 클라이언트가 보낸 `refreshToken`과 **해시가 일치하는 row를 찾는다**.
3. 찾으면:
   - 새 accessToken + 새 refreshToken 발급 (`getTokens`)
   - **해당 row의 `tokenHash`, `expiresAt`를 새 값으로 업데이트** → 이 기기에서는 항상 최신 토큰 1개만 유지
4. 못 찾으면:
   - 위조되었거나, 이미 만료/삭제된 토큰 → 403 예외

**결과**

- 각 기기(세션)별로 DB에 **row 1개**가 존재한다.
- `/auth/refresh`를 호출하면:
  - 해당 row만 갱신(로테이션)
  - 다른 기기의 row는 건드리지 않으므로, **여러 기기에서 동시에 로그인해도 세션이 안 끊긴다.**

---

## 만료/청소 전략

현재 구현:

- `expiresAt`는 refresh 토큰 생성/로테이션 시점에 `now + 7일`로 설정된다.
- `/auth/refresh`에서는 `expiresAt > now` 인 row만 "활성"으로 본다.
- **만료된 토큰 자동 정리**: `refreshAllTokens` 호출 시마다 백그라운드에서 만료된 토큰(`expiresAt < now`)을 자동으로 삭제

```ts
// refreshAllTokens 내부에서
this.cleanupExpiredTokens().catch((error) => {
  console.error('만료된 토큰 정리 중 오류:', error);
});

private async cleanupExpiredTokens(): Promise<void> {
  const now = new Date();
  await this.refreshTokenRepo.delete({
    expiresAt: LessThan(now),
  });
}
```

**의미**:

- 토큰 갱신이 발생할 때마다 만료된 토큰을 자동으로 정리
- DB에 불필요한 row가 쌓이지 않음
- 백그라운드에서 실행되므로 메인 플로우에 영향 없음

---

## 요약

1. **다중 기기 지원**
   - 로그인/회원가입/소셜 로그인 시마다 `user_refresh_tokens`에 새 row 추가
   - 각 row는 “특정 기기의 refresh 토큰 1개”를 의미
   - 여러 기기가 동시에 로그인해도 각자의 토큰이 유지된다.

2. **로테이션(Refresh 시)**
   - `/auth/refresh` 호출 시:
     - 해당 토큰 row를 찾아서
     - 새 refreshToken 해시와 새 만료 시각으로 **업데이트**  
       → 기기 하나당 항상 최신 토큰 1개만 유지

3. **로그아웃**
   - `signOut` 호출 시:

   ```ts
   // refreshToken이 있으면: 특정 기기만 로그아웃 (해당 토큰 row만 삭제)
   // refreshToken이 없으면: 백엔드에서 아무것도 하지 않음 (전체 기기 로그아웃 방지)
   await this.authService.signOut(userId, refreshToken);
   ```

   - **특정 기기만 로그아웃**: Request body나 쿠키에서 `refreshToken`을 받아서, 해당 토큰의 해시와 일치하는 row만 삭제
     - **웹**: 쿠키(`refresh_token`)에서 자동으로 읽음 (`credentials: "include"` 사용)
     - **모바일**: Request body에 `refreshToken`을 명시적으로 포함
   - **안전한 처리**: `refreshToken`이 없으면 백엔드에서 아무것도 하지 않음 (전체 기기 로그아웃 방지)
     - 클라이언트는 로컬 토큰만 삭제하고 로그인 화면으로 이동
     - 백엔드 호출 실패해도 정상적으로 처리 (네트워크 오류 등 대비)
     - 의도하지 않은 전체 기기 로그아웃 방지

4. **DB 크기 관리**
   - 현재 구조에서는 "로그인 유지 중인 세션 수만큼" row가 유지된다.
   - 만료된 row(`expiresAt < now`)는 `refreshAllTokens` 호출 시마다 자동으로 삭제됨
   - 토큰 갱신이 발생할 때마다 백그라운드에서 정리되므로 DB에 불필요한 row가 쌓이지 않음
