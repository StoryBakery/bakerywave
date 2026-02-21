---
title: Accordion / Tabs 계열
sidebar_label: Accordion / Tabs
description: BaseAccordion, Tabs, TabItem 계열 컴포넌트를 설명합니다.
---

# Accordion / Tabs 계열

## Accordion 계열

### 지원 컴포넌트

- `<BaseAccordion>`
- `<AccordionSummary>`
- `<AccordionDetails>`

### 주요 속성

#### `<BaseAccordion>`

- `defaultExpanded`: `true` 또는 `"true"`일 때 기본 열림
- `open`: 열린 상태를 강제
- `className`

### 예시 코드

```mdx
<BaseAccordion defaultExpanded>
  <AccordionSummary>자세히 보기</AccordionSummary>
  <AccordionDetails>상세 설명</AccordionDetails>
</BaseAccordion>
```

### 실제 출력

<BaseAccordion defaultExpanded>
  <AccordionSummary>자세히 보기</AccordionSummary>
  <AccordionDetails>상세 설명</AccordionDetails>
</BaseAccordion>

## Tabs 계열

### 지원 컴포넌트

- `<Tabs>`
- `<TabItem>`

### 주요 속성

#### `<TabItem>`

- `label`: 탭 제목
- `value`: 탭 식별자
  - 생략 시 `label` 또는 자동값으로 보정됩니다.

### 예시 코드

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

### 동작 메모

- `<Tabs>`는 `value`가 없는 `<TabItem>`에 자동으로 값을 채웁니다.
- 같은 페이지에서 탭을 여러 개 쓸 때는 `value`를 명시하면 상태 추적이 더 명확합니다.
