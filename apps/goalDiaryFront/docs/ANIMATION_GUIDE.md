# GoalDiary 프론트 애니메이션 가이드

이 문서는 랜딩/메인 페이지에 쓰인 애니메이션 코드를 **공부용**으로 설명합니다.

---

## 1. 전체 구조 요약

- **Tailwind**에서 `keyframes` + `animation`으로 “어떤 움직임”을 정의하고,
- **React**에서는 “언제 그 움직임을 켤지”만 결정합니다.
- “언제”는 대부분 **Intersection Observer**로 “화면에 들어왔을 때” 한 번만 재생하도록 했습니다.

즉, **애니메이션 정의(Tailwind) + 트리거 타이밍(React)** 조합입니다.

---

## 2. Tailwind 설정 (`tailwind.config.ts`)

### 2.1 keyframes = “한 번 재생될 때의 동작”

`theme.extend.keyframes`에 이름과 구간을 넣습니다.

| 이름 | 0% (시작) | 100% (끝) | 쓰이는 곳 |
|------|------------|-----------|-----------|
| `fade-in-up` | 아래 56px, 반투명 | 제자리, 불투명 | 스크롤 시 블록 등장 |
| `fade-in` | 반투명 | 불투명 | 단순 페이드인 |
| `pop-in` | 0.94배, 65%에서 1.04배 overshoot | 1배 | CTA 등 강조 |
| `slide-in-from-left` | 왼쪽 -80px, 반투명 | 제자리 | 히어로 왼쪽 |
| `slide-in-from-right` | 오른쪽 +80px, 반투명 | 제자리 | 히어로 로그인 카드 |
| `letter-drop` | 위 -16px, 투명 | 제자리, 불투명 | 제목 글자 하나씩 |

- `transform: translateY(56px)` → **아래**에서 올라오는 느낌.
- `translateY(-16px)` → **위**에서 떨어지는 느낌 (letter-drop).
- `forwards`는 애니메이션 끝 상태를 유지한다는 뜻 (끝나도 100% 스타일 유지).

### 2.2 animation = “실제로 적용할 때의 옵션”

`theme.extend.animation`에서 **키프레임 이름 + 시간 + 이징 + forwards**를 한 덩어리로 만듭니다.

```ts
'fade-in-up': 'fade-in-up 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards'
//            ↑ 키프레임   ↑ 시간  ↑ 이징(부드러움)              ↑ 끝 상태 유지
```

- `cubic-bezier(0.22, 1, 0.36, 1)` → 끝으로 갈수록 살짝 “감속”되는 느낌.
- 클래스로는 `animate-fade-in-up`, `animate-letter-drop` 처럼 `animate-{이름}`으로 씁니다.

---

## 3. “화면에 들어왔을 때만” 재생하는 패턴 (Intersection Observer)

여러 컴포넌트가 같은 패턴을 씁니다.

1. **ref**로 DOM 요소를 잡고
2. **Intersection Observer**로 “그 요소가 뷰포트에 얼마나 보이는지” 감지
3. `threshold` 이상 보이면 **setState(true)** 로 “등장 시점” 기록
4. 그때부터 **애니메이션 클래스**를 붙임 (`animate-xxx`)
5. unmount 시 **io.disconnect()** 로 옵저버 해제 (메모리/이벤트 정리)

```ts
const ref = useRef<HTMLDivElement>(null);
const [inView, setInView] = useState(false);

useEffect(() => {
  const el = ref.current;
  if (!el) return;
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) setInView(true);  // 한 번 true 되면 계속 true
    },
    { threshold: 0.15 }  // 15% 보이면 트리거
  );
  io.observe(el);
  return () => io.disconnect();
}, []);

// JSX
<div ref={ref} className={inView ? "animate-fade-in-up" : "초기상태 클래스"}>
  {children}
</div>
```

- `threshold`: 0~1. 요소가 얼마나 보여야 `isIntersecting`이 true 되는지.
- `rootMargin`: 뷰포트를 넓히거나 줄여서 “조금 일찍/늦게” 트리거할 수 있음 (ScrollReveal에서 사용).

---

## 4. 컴포넌트별 설명

### 4.1 LetterDropReveal (제목 글자 하나씩 떨어지기)

- **역할**: "왜 GoalDiary를 선택해야 할까요?" 같은 문장을 **한 글자씩** 위→아래로 떨어지며 등장.
- **방식**:
  - `Array.from(text)`로 글자 배열 만든 뒤, 각 글자를 `<span>` 하나씩 렌더.
  - 각 span에 **같은 키프레임** `animate-letter-drop` 적용하고, **animationDelay**만 `i * delayPerChar` ms 로 다르게 줌 → 차례로 떨어지는 느낌.
  - 공백은 `\u00A0`(줄바꿈 안 되는 공백)로 해서 레이아웃이 안 깨지게 함.
  - **초기 상태**: `opacity-0 -translate-y-4` (안 보이고 위에 있음). `inView`가 true 되면 `animate-letter-drop`가 0%→100%로 움직이면서 제자리로 오고 보이게 함.
- **트리거**: 위와 동일한 Intersection Observer. 해당 제목이 화면에 들어올 때 한 번만 재생.

### 4.2 ScrollReveal (섹션 블록 fade-in-up)

- **역할**: 카드/문단 블록이 **아래에서 살짝 올라오면서** 나타남.
- **방식**:
  - **초기**: `opacity-40 translate-y-14` (56px 아래, 반투명).
  - **inView**: `animate-fade-in-up` 추가. 키프레임이 56px 아래 → 0으로 올라가며 opacity 1.
  - `delay` prop으로 ms 단위 지연 가능 (여러 개 나란히 쓸 때 스태거드 효과).
  - `rootMargin: "0px 0px -60px 0px"` → 뷰포트 아래쪽을 60px 줄인 영역으로 계산해서, “완전히 들어오기 조금 전”에 트리거되게 함.

### 4.3 PopInOnScroll (CTA 등 강조)

- **역할**: “지금 바로 시작해보세요” 같은 CTA가 **작았다가 살짝 튀어나오는** 느낌.
- **방식**:
  - **초기**: `scale-[0.94] opacity-90` (작고 살짝 흐림).
  - **inView**: `animate-pop-in`. 키프레임이 0.94 → 65%에서 1.04(overshoot) → 1.0으로 수렴.
  - `origin-center`로 크기 변화가 중앙 기준.

### 4.4 HeroSection (페이지 로드 시 왼/오른쪽 슬라이드)

- **역할**: 첫 화면에서 왼쪽 텍스트는 **왼쪽에서**, 로그인 카드는 **오른쪽에서** 스르륵 등장.
- **방식**:
  - Intersection Observer 없음. **페이지 로드 시부터** `animate-slide-in-from-left` / `animate-slide-in-from-right` 적용.
  - **초기 상태**가 키프레임 0%와 맞춰져 있음: `opacity-40 -translate-x-20`(왼쪽), `translate-x-20`(오른쪽).
  - **stagger**: 각 요소마다 `style={{ animationDelay: "0ms" }}`, `"100ms"`, `"200ms"` … 로 순서대로 딜레이를 줘서 차례로 들어오게 함.

---

## 5. 카드 호버 (group / group-hover)

- **목적**: 카드에 마우스를 올리면 **카드 전체(번호 뱃지 포함)**가 살짝 올라가고 확대·그림자 강조.
- **방식**:
  - 바깥에 `className="group"` 인 div. 이 div에 마우스가 올라가면 “그룹이 hover된 상태”가 됨.
  - 그 안의 자식들에 `group-hover:scale-[1.02]`, `group-hover:-translate-y-1`, `group-hover:shadow-xl` 등을 줌.
  - **사용방법 카드**는 번호(1,2,3)와 카드가 **같이** 움직여야 하므로, scale/translate를 **번호+카드를 감싼 div**에 적용하고, 그 div에만 `group-hover:...`를 붙였음. 그래서 호버 시 뱃지와 카드가 한 덩어리로 올라감.

---

## 6. 정리

| 하고 싶은 것 | 사용하는 것 |
|-------------|-------------|
| 스크롤해서 보일 때 한 번 등장 | Intersection Observer + inView → animate-xxx |
| 글자마다 순서대로 등장 | 글자별 span + animationDelay (i * ms) |
| 페이지 로드 시 한 번 등장 | 초기 클래스 + animate-xxx + animationDelay로 stagger |
| 호버 시 카드/뱃지 같이 반응 | group + group-hover, 트랜지션 적용할 wrapper 한 겹 |

Tailwind의 `keyframes`/`animation`은 “한 번 재생되는 동작”만 정의하고, “언제 재생할지”는 React 상태(ref, inView)와 옵저버로 제어한다고 보면 됩니다.
