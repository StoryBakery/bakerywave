---
title: Layout / Text 계열
sidebar_label: Layout / Text
description: Grid, Typography, KeyboardInput 컴포넌트의 속성을 설명합니다.
---

# Layout / Text 계열

## 지원 컴포넌트

- `<GridContainer>`
- `<Grid>`
- `<Typography>`
- `<KeyboardInput>`

## `<GridContainer>`

여러 `Grid item`을 감싸는 그리드 컨테이너입니다.

주요 속성:

- `numColumns`: 컬럼 개수(기본값 `2`)
- `className`, `style`

## `<Grid>`

컨테이너/아이템 역할을 모두 지원합니다.

주요 속성:

- 컨테이너 역할: `container`, `spacing`, `alignItems`, `direction`, `wrap`
- 아이템 역할: `item`, `xs`, `XSmall`, `Medium`, `Large`, `XLarge`
- 공통: `className`, `style`

예시 코드:

```mdx
<Grid container spacing={2}>
  <Grid item xs={12} Medium={6}>
    왼쪽 블록
  </Grid>
  <Grid item xs={12} Medium={6}>
    오른쪽 블록
  </Grid>
</Grid>
```

## `<Typography>`

문서 내 텍스트 스타일을 통일할 때 사용합니다.

주요 속성:

- `variant`: `h1`~`h6`, `subtitle1`, `subtitle2`, `body1`, `body2`, `caption`, `overline`
- `component`: 실제 렌더 태그 지정
- `noWrap`: 줄바꿈 방지
- `className`, `style`

예시 코드:

```mdx
<Typography variant="h4">릴리즈 체크리스트</Typography>
<Typography variant="body2">빌드, 테스트, 배포 순서를 확인하세요.</Typography>
```

## `<KeyboardInput>`

키보드 키 표시용 컴포넌트입니다.

```mdx
<KeyboardInput>Ctrl</KeyboardInput> + <KeyboardInput>C</KeyboardInput>
```
