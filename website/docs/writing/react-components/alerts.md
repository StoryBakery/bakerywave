---
title: Alert 계열
sidebar_label: Alert 계열
description: Alert, AlertTitle 컴포넌트의 동작과 속성을 설명합니다.
---

# Alert 계열

## 지원 컴포넌트

- `<Alert>`
- `<AlertTitle>`

## `<Alert>`

알림 박스를 렌더링합니다.

### 주요 속성

| 속성 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `severity` | `"info" \| "warning" \| "error" \| "success"` | `"info"` | 알림 의미를 지정합니다. |
| `variant` | `"standard" \| "outlined"` | `"standard"` | 표시 스타일을 지정합니다. |
| `className` | `string` | 없음 | 커스텀 클래스를 추가합니다. |
| `style` | `React.CSSProperties` | 없음 | 인라인 스타일을 적용합니다. |

### 예시 코드

```mdx
<Alert severity="warning">
  <AlertTitle>주의</AlertTitle>
  설정 값을 확인하세요.
</Alert>

<Alert severity="info" variant="outlined">
  <AlertTitle>안내</AlertTitle>
  outlined 스타일 알림입니다.
</Alert>
```

### 실제 출력

<Alert severity="warning">
  <AlertTitle>주의</AlertTitle>
  설정 값을 확인하세요.
</Alert>

<Alert severity="info" variant="outlined">
  <AlertTitle>안내</AlertTitle>
  outlined 스타일 알림입니다.
</Alert>

## `<AlertTitle>`

`<Alert>` 내부에서 제목 텍스트를 강조해 표시합니다.

```mdx
<Alert severity="success">
  <AlertTitle>완료</AlertTitle>
  배포가 끝났습니다.
</Alert>
```
