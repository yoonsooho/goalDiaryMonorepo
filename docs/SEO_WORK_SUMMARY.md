# GoalDiary SEO 작업 정리

이 문서는 GoalDiary 웹 프론트엔드에서 수행한 SEO 관련 작업을 정리한 것입니다.

## 📋 작업 목록

### 1. 메타데이터 설정 (Metadata)

**파일 위치:** `apps/goalDiaryFront/src/app/layout.tsx`

**작업 내용:**

- 기본 메타데이터 설정
- Open Graph 태그 설정 (소셜 미디어 공유용)
- Twitter Card 설정
- Google 사이트 인증 코드 추가

**설정된 항목:**

```typescript
{
  title: "GoalDiary - 목표와 일기를 함께하는 스마트 작업관리",
  description: "GoalDiary는 개인의 목표, 명언, 일기와 팀 협업을 하나로 통합한 혁신적인 플랫폼입니다...",
  keywords: ["목표관리", "일기앱", "개인성장", "칸반보드", "명언관리", "팀협업", ...],
  openGraph: {
    title: "...",
    description: "...",
    url: "https://goaldiary.vercel.app/",
    siteName: "GoalDiary",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "...",
    description: "...",
  },
  verification: {
    google: "JxjjD7DM8P_qMCHuPj4jjk7qqIk8iGFA2td5hWndwh8", // Google Search Console 인증 코드
  }
}
```

**Google 사이트 인증:**

- Google Search Console에서 사이트 소유권 확인을 위한 메타 태그 추가
- 인증 코드: `JxjjD7DM8P_qMCHuPj4jjk7qqIk8iGFA2td5hWndwh8`

---

### 2. 사이트맵 생성 (Sitemap)

**파일 위치:** `apps/goalDiaryFront/src/app/sitemap.ts`

**작업 내용:**

- Next.js의 동적 사이트맵 생성 기능 사용
- 주요 페이지를 검색엔진에 등록

**등록된 페이지:**

- `https://goaldiary.vercel.app/` (우선순위: 1.0, 업데이트 빈도: daily)
- `https://goaldiary.vercel.app/main` (우선순위: 0.8, 업데이트 빈도: daily)

**접근 URL:**

- `https://goaldiary.vercel.app/sitemap.xml`

---

### 3. Robots.txt 설정

**파일 위치:** `apps/goalDiaryFront/src/app/robots.ts`

**작업 내용:**

- 검색엔진 크롤러 접근 제어
- 사이트맵 위치 안내

**설정 내용:**

```typescript
{
  rules: {
    userAgent: "*", // 모든 검색엔진에게 적용
    allow: "/", // 루트 경로는 크롤링 허용
    disallow: ["/api/", "/auth-loading/"], // API와 로딩 페이지는 크롤링 금지
  },
  sitemap: "https://goaldiary.vercel.app/sitemap.xml",
}
```

**접근 URL:**

- `https://goaldiary.vercel.app/robots.txt`

---

### 4. 구조화된 데이터 (Structured Data / JSON-LD)

**파일 위치:** `apps/goalDiaryFront/src/app/page.tsx`

**작업 내용:**

- Schema.org 표준을 따르는 구조화된 데이터 추가
- 검색엔진이 사이트 정보를 더 잘 이해할 수 있도록 함

**추가된 스키마:**

- `WebApplication` 타입
- 앱 이름, 설명, URL
- 카테고리: ProductivityApplication
- 기능 목록 (Feature List)
- 가격 정보 (무료)
- ⚠️ **평점 정보는 제거됨** (실제 리뷰 데이터가 없으므로 Google 정책 위반 방지)

**코드 예시:**

```typescript
const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "GoalDiary",
    description: "...",
    url: "https://goaldiary.vercel.app",
    applicationCategory: "ProductivityApplication",
    featureList: [
        "BIG3 우선순위 스케줄링",
        "실시간 팀 협업 기능",
        "루틴 추적 및 통계",
        "명언 및 일기 관리",
        "완전 무료 사용",
    ],
    // aggregateRating은 실제 리뷰 데이터가 있을 때만 사용
    // 현재는 리뷰 시스템이 없으므로 제거됨
    // ...
};
```

---

### 5. Google Play Console 요구사항 페이지

#### 5-1. 계정 삭제 안내 페이지

**파일 위치:** `apps/goalDiaryFront/src/app/account-deletion/page.tsx`

**작업 내용:**

- Google Play Console의 계정 삭제 정책 요구사항 충족
- 사용자가 계정 삭제 방법을 확인할 수 있는 공개 페이지

**접근 URL:**

- `https://goaldiary.vercel.app/account-deletion`

**포함 내용:**

- 모바일 앱에서 계정 삭제 방법
- 웹에서 계정 삭제 방법
- 기술적 처리 방식 (API 엔드포인트)
- 삭제되는 데이터 범위
- 계정 삭제 취소 안내
- 문의처

---

#### 5-2. 개인정보처리방침 페이지

**파일 위치:** `apps/goalDiaryFront/src/app/privacy/page.tsx`

**작업 내용:**

- Google Play Console의 개인정보처리방침 요구사항 충족
- 사용자가 개인정보 처리 방침을 확인할 수 있는 공개 페이지

**접근 URL:**

- `https://goaldiary.vercel.app/privacy`

**포함 내용:**

- 수집하는 개인정보의 항목
- 개인정보의 이용 목적
- 개인정보의 보관 및 파기
- 개인정보의 제3자 제공
- 개인정보 처리의 위탁
- 이용자의 권리
- 데이터 전송 시 암호화
- 아동의 개인정보 보호
- 개인정보처리방침의 변경
- 문의처

---

## 🔧 Google Search Console 설정

### 1. 사이트 등록

1. **Google Search Console 접속**
    - URL: https://search.google.com/search-console
    - Google 계정으로 로그인

2. **속성 추가**
    - 속성 유형: URL 접두어
    - URL 입력: `https://goaldiary.vercel.app`

3. **소유권 확인**
    - 방법: HTML 태그
    - 인증 코드: `JxjjD7DM8P_qMCHuPj4jjk7qqIk8iGFA2td5hWndwh8`
    - 위치: `apps/goalDiaryFront/src/app/layout.tsx`의 `metadata.verification.google`

4. **확인 완료**
    - Google Search Console에서 사이트 소유권 확인 완료

### 2. 사이트맵 제출

1. **사이트맵 제출**
    - Google Search Console → 색인 생성 → Sitemaps
    - 사이트맵 URL 입력: `https://goaldiary.vercel.app/sitemap.xml`
    - 제출 완료

### 3. URL 검사

1. **URL 검사 도구 사용**
    - Google Search Console → URL 검사
    - 주요 페이지 URL 입력하여 색인 생성 요청

---

## 📊 SEO 최적화 요소

### 완료된 작업

✅ **메타데이터 설정**

- Title, Description, Keywords
- Open Graph (소셜 미디어 공유 최적화)
- Twitter Card

✅ **사이트맵 생성**

- 동적 사이트맵 생성
- 주요 페이지 등록

✅ **Robots.txt 설정**

- 크롤러 접근 제어
- 사이트맵 위치 안내

✅ **구조화된 데이터 (JSON-LD)**

- Schema.org WebApplication 스키마
- 검색엔진 이해도 향상

✅ **Google Search Console 연동**

- 사이트 소유권 확인
- 사이트맵 제출
- 색인 생성 모니터링

✅ **Google Play Console 요구사항 충족**

- 계정 삭제 안내 페이지
- 개인정보처리방침 페이지

### 추가로 고려할 수 있는 작업

⚠️ **아직 미완료 (선택사항)**

- [ ] Open Graph 이미지 추가 (`og-image.jpg`)
- [ ] Twitter Card 이미지 추가
- [ ] 추가 페이지 사이트맵 등록 (diary, main 등)
- [ ] Google Analytics 연동
- [ ] 페이지별 메타데이터 최적화
- [ ] 캐노니컬 URL 설정
- [ ] 다국어 지원 (hreflang 태그)

---

## 🔗 관련 파일 위치

```
apps/goalDiaryFront/
├── src/
│   └── app/
│       ├── layout.tsx          # 메타데이터 설정 (Google 인증 포함)
│       ├── page.tsx             # 구조화된 데이터 (JSON-LD)
│       ├── sitemap.ts           # 사이트맵 생성
│       ├── robots.ts            # Robots.txt 생성
│       ├── account-deletion/
│       │   └── page.tsx         # 계정 삭제 안내 페이지
│       └── privacy/
│           └── page.tsx         # 개인정보처리방침 페이지
```

---

## 📝 Google Search Console 접속 정보

**URL:** https://search.google.com/search-console

**설정된 사이트:**

- `https://goaldiary.vercel.app`

**인증 방법:**

- HTML 태그 (메타 태그)
- 인증 코드: `JxjjD7DM8P_qMCHuPj4jjk7qqIk8iGFA2td5hWndwh8`

---

## 🎯 주요 URL

- **메인 페이지:** https://goaldiary.vercel.app
- **사이트맵:** https://goaldiary.vercel.app/sitemap.xml
- **Robots.txt:** https://goaldiary.vercel.app/robots.txt
- **계정 삭제 안내:** https://goaldiary.vercel.app/account-deletion
- **개인정보처리방침:** https://goaldiary.vercel.app/privacy

---

## 📌 참고사항

1. **Google Search Console**
    - 사이트 소유권 확인 완료
    - 사이트맵 제출 완료
    - 색인 생성 모니터링 가능

2. **Google Play Console**
    - 계정 삭제 안내 페이지 URL: `https://goaldiary.vercel.app/account-deletion`
    - 개인정보처리방침 URL: `https://goaldiary.vercel.app/privacy`
    - 두 페이지 모두 공개 접근 가능 (로그인 불필요)

3. **Next.js SEO 기능 활용**
    - Next.js 13+ App Router의 메타데이터 API 사용
    - 동적 사이트맵 및 Robots.txt 생성
    - 구조화된 데이터 (JSON-LD) 지원

---

## 🔄 업데이트 이력

- 초기 SEO 설정 완료
- Google Search Console 연동 완료
- Google Play Console 요구사항 페이지 생성 완료
