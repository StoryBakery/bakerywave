---
title: Button / Card 계열
sidebar_label: Button / Card
description: Button, Card 계열 컴포넌트의 동작과 속성을 설명합니다.
---

# Button / Card 계열

## 지원 컴포넌트

- `<Button>`
- `<Card>`
- `<CardContent>`
- `<CardActions>`

## `<Button>`

링크/액션 버튼을 렌더링합니다.

### 주요 속성

| 속성 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `variant` | `contained \| outlined \| text \| link` | `contained` | 버튼 표시 형태 |
| `size` | `small \| medium \| large` | `medium` | 크기 |
| `color` | `string` | `primary` | 색상 키 |
| `href` | `string` | 없음 | 있으면 `<a>`로 렌더 |
| `target` | `string` | 없음 | 링크 target |
| `rel` | `string` | 자동 보정 | `target="_blank"`일 때 미지정 시 `noopener noreferrer` |
| `className`, `style` | - | 없음 | 스타일 확장 |

### 예시 코드

```mdx
<Button>Primary</Button>
<Button variant="outlined" size="small">Outlined</Button>
<Button variant="text" color="secondary">Text</Button>
<Button href="https://github.com/storybakery/bakerywave" target="_blank">
  External Link
</Button>
```

### 실제 출력

<Button>Primary</Button>
<Button variant="outlined" size="small">Outlined</Button>
<Button variant="text" color="secondary">Text</Button>
<Button href="https://github.com/storybakery/bakerywave" target="_blank">
  External Link
</Button>

## `<Card>`, `<CardContent>`, `<CardActions>`

카드 레이아웃을 구성할 때 함께 사용합니다.

### 예시 코드

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

### 실제 출력

<Card>
  <CardContent>
    카드 본문입니다.
  </CardContent>
  <CardActions>
    <Button size="small">확인</Button>
    <Button variant="text" size="small">취소</Button>
  </CardActions>
</Card>
