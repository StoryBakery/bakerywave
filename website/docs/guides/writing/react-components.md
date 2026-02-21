---
title: 지원 React 컴포넌트
sidebar_label: React Components
description: Bakerywave 문서에서 현재 지원하는 React 컴포넌트와 속성을 정리합니다.
---

# 지원 React 컴포넌트

이 문서는 **현재 구현된 컴포넌트만** 정리합니다.
기준 구현 파일은 `packages/docs-theme/theme/MDXComponents.js` 입니다.

## 안내

- `.md`/`.mdx` 문서 모두에서 동일하게 사용할 수 있습니다.
- 아래 속성은 현재 구현 기준이며, 문서 업데이트에 따라 바뀔 수 있습니다.

## Alert 계열

### `<Alert>`

알림 박스 컴포넌트입니다.

#### `severity`

`"info" | "warning" | "error" | "success"`  
기본값: `"info"`

설명:
알림의 의미(정보/주의/오류/성공)를 지정합니다.

예시 코드:
```mdx
<Alert severity="warning">
<AlertTitle>주의</AlertTitle>
설정 값을 확인하세요.
</Alert>
```

실제 출력:
<Alert severity="warning">
<AlertTitle>주의</AlertTitle>
설정 값을 확인하세요.
</Alert>

<details>
<summary>열람 상세 예시</summary>

활용:
- `info`: 일반 안내
- `warning`: 주의 필요
- `error`: 실패/오류
- `success`: 완료/성공

```mdx
<Alert severity="info">정보</Alert>
<Alert severity="warning">주의</Alert>
<Alert severity="error">오류</Alert>
<Alert severity="success">성공</Alert>
```

<Alert severity="info">정보</Alert>
<Alert severity="warning">주의</Alert>
<Alert severity="error">오류</Alert>
<Alert severity="success">성공</Alert>

</details>

#### `variant`

`"standard" | "outlined"`  
기본값: `"standard"`

설명:
알림 박스의 시각 스타일을 지정합니다.

예시 코드:
```mdx
<Alert severity="info" variant="outlined">
<AlertTitle>안내</AlertTitle>
outlined 스타일 알림입니다.
</Alert>
```

실제 출력:
<Alert severity="info" variant="outlined">
<AlertTitle>안내</AlertTitle>
outlined 스타일 알림입니다.
</Alert>

<details>
<summary>열람 상세 예시</summary>

`standard`는 기본 배경형, `outlined`는 테두리 강조형입니다.

```mdx
<Alert severity="warning" variant="standard">기본형</Alert>
<Alert severity="warning" variant="outlined">외곽선형</Alert>
```

<Alert severity="warning" variant="standard">기본형</Alert>
<Alert severity="warning" variant="outlined">외곽선형</Alert>

</details>

#### `className`

`string`

설명:
커스텀 CSS 클래스를 추가합니다.

예시 코드:
```mdx
<Alert severity="info" className="my-alert">
커스텀 클래스가 적용된 알림입니다.
</Alert>
```

<details>
<summary>열람 상세 예시</summary>

`className`은 문서 테마 CSS에서 별도 스타일을 정의할 때 사용합니다.

```css
.my-alert {
  border-width: 2px;
}
```

</details>

#### `style`

`React.CSSProperties`

설명:
인라인 스타일을 적용합니다.

예시 코드:
```mdx
<Alert severity="info" style={{ marginTop: '20px' }}>
상단 여백이 있는 알림입니다.
</Alert>
```

실제 출력:
<Alert severity="info" style={{ marginTop: '20px' }}>
상단 여백이 있는 알림입니다.
</Alert>

<details>
<summary>열람 상세 예시</summary>

간단한 1회성 스타일 조정에만 사용하는 것을 권장합니다.

```mdx
<Alert severity="success" style={{ maxWidth: '480px' }}>
너비 제한 알림
</Alert>
```

<Alert severity="success" style={{ maxWidth: '480px' }}>
너비 제한 알림
</Alert>

</details>

### `<AlertTitle>`

`<Alert>` 내부 제목 텍스트를 렌더링합니다.

## 아코디언 계열

### `<BaseAccordion>`

주요 속성:
- `defaultExpanded`: `true`/`"true"`일 때 기본 열림
- `open`: 열린 상태 강제
- `className`

### `<AccordionSummary>`

아코디언 요약(클릭 헤더) 영역입니다.

### `<AccordionDetails>`

아코디언 본문 영역입니다.

```mdx
<BaseAccordion defaultExpanded>
  <AccordionSummary>자세히 보기</AccordionSummary>
  <AccordionDetails>상세 설명</AccordionDetails>
</BaseAccordion>
```

## 탭 계열

### `<Tabs>`

탭 컨테이너입니다.

### `<TabItem>`

주요 속성:
- `label`
- `value` (생략 시 `label` 또는 자동값으로 보정)

````mdx
<Tabs>
  <TabItem label="Luau">
    ```lua
    print("Hello")
    ```
  </TabItem>
  <TabItem label="JavaScript">
    ```js
    console.log("Hello");
    ```
  </TabItem>
</Tabs>
````

## 레이아웃 계열

### `<GridContainer>`

주요 속성:
- `numColumns` (기본값: `2`)
- `className`, `style`

### `<Grid>`

주요 속성:
- 컨테이너: `container`, `spacing`, `alignItems`, `direction`, `wrap`
- 아이템: `item`, `xs`, `XSmall`, `Medium`, `Large`, `XLarge`
- 공통: `className`, `style`

## 텍스트 계열

### `<Typography>`

주요 속성:
- `variant`: `h1`~`h6`, `subtitle1`, `subtitle2`, `body1`, `body2`, `caption`, `overline`
- `component`
- `noWrap`
- `className`, `style`

### `<KeyboardInput>`

키보드 키 표시용 컴포넌트입니다.

```mdx
<KeyboardInput>Ctrl</KeyboardInput> + <KeyboardInput>C</KeyboardInput>
```

## 버튼/카드 계열

### `<Button>`

주요 속성:
- `variant`: `contained` | `outlined` | `text` | `link` (기본값: `contained`)
- `size`: `small` | `medium` | `large` (기본값: `medium`)
- `color`: 문자열 (기본값: `primary`)
- `href`, `target`, `rel`
- `className`, `style`

설명:
- `href`가 있으면 `<a>`로 렌더링됩니다.
- `target="_blank"`일 때 `rel`을 생략하면 `noopener noreferrer`가 자동 적용됩니다.
- 잘못된 `variant`/`size` 값은 기본값으로 보정됩니다.

예시 코드:
```mdx
<Button>Primary</Button>
<Button variant="outlined" size="small">Outlined</Button>
<Button variant="text" color="secondary">Text</Button>
<Button href="https://github.com/storybakery/bakerywave" target="_blank">
  External Link
</Button>
```

실제 출력:
<Button>Primary</Button>
<Button variant="outlined" size="small">Outlined</Button>
<Button variant="text" color="secondary">Text</Button>
<Button href="https://github.com/storybakery/bakerywave" target="_blank">
  External Link
</Button>

<details>
<summary>열람 상세 예시</summary>

```mdx
<Button variant="contained" size="large">Large</Button>
<Button variant="link" href="https://create.roblox.com/">Link Variant</Button>
```

<Button variant="contained" size="large">Large</Button>
<Button variant="link" href="https://create.roblox.com/">Link Variant</Button>

</details>

### `<Card>`, `<CardContent>`, `<CardActions>`

카드 레이아웃 컴포넌트입니다.
각 컴포넌트에서 `className`, `style`을 사용할 수 있습니다.

예시 코드:
```mdx
<Card>
  <CardContent>
    카드 본문입니다.
  </CardContent>
  <CardActions>
    <Button size="small">확인</Button>
    <Button variant="text" size="small">취소</Button>
  </CardActions>
</Card>
```

실제 출력:
<Card>
  <CardContent>
    카드 본문입니다.
  </CardContent>
  <CardActions>
    <Button size="small">확인</Button>
    <Button variant="text" size="small">취소</Button>
  </CardActions>
</Card>

<details>
<summary>열람 상세 예시</summary>

```mdx
<Card style={{ maxWidth: 420 }}>
  <CardContent>
    <Typography variant="h4">릴리즈 체크리스트</Typography>
    <Typography variant="body2">빌드, 테스트, 배포 순서를 확인하세요.</Typography>
  </CardContent>
  <CardActions>
    <Button variant="outlined" size="small">문서 보기</Button>
    <Button size="small">실행</Button>
  </CardActions>
</Card>
```

<Card style={{ maxWidth: 420 }}>
  <CardContent>
    <Typography variant="h4">릴리즈 체크리스트</Typography>
    <Typography variant="body2">빌드, 테스트, 배포 순서를 확인하세요.</Typography>
  </CardContent>
  <CardActions>
    <Button variant="outlined" size="small">문서 보기</Button>
    <Button size="small">실행</Button>
  </CardActions>
</Card>

</details>

## 기타 컴포넌트

### `<Chip>`

주요 속성:
- `label` (또는 `children`)
- `size`: `small` | `medium` (기본값: `medium`)
- `variant`: `outlined` | `filled` (기본값: `filled`)
- `color` (기본값: `default`)
- `className`, `style`

예시 코드:
```mdx
<Chip label="Stable" />
<Chip label="Beta" color="warning" />
<Chip variant="outlined" size="small">Custom</Chip>
```

실제 출력:
<Chip label="Stable" />
<Chip label="Beta" color="warning" />
<Chip variant="outlined" size="small">Custom</Chip>

<details>
<summary>열람 상세 예시</summary>

```mdx
<Chip label="Docs" color="primary" />
<Chip label="Experimental" variant="outlined" color="danger" />
```

<Chip label="Docs" color="primary" />
<Chip label="Experimental" variant="outlined" color="danger" />

</details>

### `<BetaAlert>`

주요 속성:
- `betaName` (기본값: `This feature`)
- `leadIn` (기본값: `This feature is currently in beta. Enable it through `)
- `leadOut` (기본값: `.`)
- `className`

예시 코드:
```mdx
<BetaAlert betaName="Asset Pipeline" />
<BetaAlert
  betaName="Studio Sync"
  leadIn="Studio에서 먼저 베타를 켜세요: "
  leadOut=" 설정 후 다시 시도하세요."
/>
```

실제 출력:
<BetaAlert betaName="Asset Pipeline" />
<BetaAlert
  betaName="Studio Sync"
  leadIn="Studio에서 먼저 베타를 켜세요: "
  leadOut=" 설정 후 다시 시도하세요."
/>

<details>
<summary>열람 상세 예시</summary>

```mdx
<BetaAlert
  betaName="Streaming API"
  leadIn="이 기능은 베타입니다. 먼저 "
  leadOut=" 를 완료한 뒤 사용하세요."
/>
```

<BetaAlert
  betaName="Streaming API"
  leadIn="이 기능은 베타입니다. 먼저 "
  leadOut=" 를 완료한 뒤 사용하세요."
/>

</details>

### `<UseStudioButton>`

주요 속성:
- `buttonTextTranslationKey` (`Action.EditInStudio` 지원)
- `buttonText`
- `placeId`
- `universeId`
- `variant`
- `className`

동작 우선순위:
- 라벨: `buttonText` -> `buttonTextTranslationKey` -> 기본값(`Open in Studio`)
- 링크: `universeId` -> `placeId` -> `#`

예시 코드:
```mdx
<UseStudioButton buttonTextTranslationKey="Action.EditInStudio" universeId="123456789" />
<UseStudioButton buttonText="Open Place" placeId="987654321" variant="outlined" />
```

실제 출력:
<UseStudioButton buttonTextTranslationKey="Action.EditInStudio" universeId="123456789" />
<UseStudioButton buttonText="Open Place" placeId="987654321" variant="outlined" />

<details>
<summary>열람 상세 예시</summary>

```mdx
<UseStudioButton buttonText="Dashboard" universeId="246813579" />
<UseStudioButton buttonText="Place Link" placeId="135792468" variant="text" />
```

<UseStudioButton buttonText="Dashboard" universeId="246813579" />
<UseStudioButton buttonText="Place Link" placeId="135792468" variant="text" />

</details>

## 기본 MDX 요소 매핑

아래 요소도 MDX에서 사용할 수 있습니다.

- `details` / `Details`
- `code`, `a`, `pre`, `ul`, `li`, `img`
- `h1`~`h6`
- `mermaid`
