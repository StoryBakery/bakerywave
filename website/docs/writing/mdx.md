---
title: MDX 확장 문법
sidebar_label: MDX Features
description: React 컴포넌트와 확장 기능을 사용하는 MDX 문법을 알아봅니다.
---

# MDX 확장 문법

Bakerywave는 **MDX(.mdx)** 형식을 지원합니다. MDX는 Markdown 안에 **React 컴포넌트**를 직접 사용할 수 있게 해주는 강력한 기능입니다.

## MDX란 무엇인가요?

MDX는 **M**ark**d**own + JS**X**의 약자입니다.
기본적인 Markdown 문법 외에도, 아래와 같은 동적인 기능을 문서에 추가할 수 있습니다.

- React 컴포넌트 사용 (`<MyComponent />`)
- JavaScript 변수 및 로직 사용
- 문서 안에 다른 문서 포함하기

## React 컴포넌트 사용하기

문서 중간에 버튼, 알림 박스, 탭 등을 넣고 싶다면 React 컴포넌트를 사용할 수 있습니다.
Bakerywave는 자주 쓰는 컴포넌트를 **전역 등록**하므로, 대부분은 `import` 없이 바로 사용하면 됩니다.

### Alert 컴포넌트 (알림 박스)

Bakerywave는 Roblox 문서 스타일에 맞춰 `<Alert>` 컴포넌트를 사용합니다.

```mdx
<Alert severity="info">
<AlertTitle>정보</AlertTitle>
이것은 정보 메시지입니다.
</Alert>

<Alert severity="warning">
<AlertTitle>주의</AlertTitle>
이것은 주의 메시지입니다.
</Alert>
```

`severity`는 아래 값 중 하나를 사용합니다.

- `error`
- `info`
- `success`
- `warning`

### 탭 (Tabs)

여러 언어의 코드 예제를 보여줄 때 유용합니다.

````mdx
<Tabs>
  <TabItem value="lua" label="Luau">
    ```lua
    print("Hello Luau")
    ```
  </TabItem>
  <TabItem value="js" label="JavaScript">
    ```js
    console.log("Hello JS");
    ```
  </TabItem>
</Tabs>
````

### Reference 스타일 컴포넌트

Reference UI에서 쓰는 `sb-ref-*` 스타일도 문서에서 바로 재사용할 수 있습니다.

```mdx
<ReferenceList>
  <ReferenceRow>
    <ReferenceCellIcon kind="property" />
    <ReferenceCellContent>
      <ReferenceName href="#enabled">Enabled</ReferenceName>
      <ReferenceSeparator />
      <ReferenceType>boolean</ReferenceType>
      <ReferenceBadge type="readonly">ReadOnly</ReferenceBadge>
    </ReferenceCellContent>
  </ReferenceRow>
  <ReferenceRow deprecated>
    <ReferenceCellIcon kind="method" />
    <ReferenceCellContent>
      <ReferenceName href="#destroy">Destroy</ReferenceName>
      <ReferenceSeparator />
      <ReferenceType>() -&gt; ()</ReferenceType>
      <ReferenceBadge type="deprecated">Deprecated</ReferenceBadge>
    </ReferenceCellContent>
  </ReferenceRow>
</ReferenceList>
```

짧은 별칭(`RefList`, `RefRow`, `RefBadge` 등)도 동일하게 사용할 수 있습니다.

## HTML 사용하기

Markdown 외에도 직접 HTML 태그를 사용할 수 있습니다.

```html
<div style={{ backgroundColor: 'blue', color: 'white' }}>
  파란 배경의 텍스트입니다.
</div>
```

단, 일반 HTML과 달리 `class` 대신 `className`을 사용해야 하며, 스타일은 객체 형태로 전달해야 합니다 (React 문법).

## 변수 및 데이터 사용

문서 내에서 변수를 정의하고 사용할 수 있습니다.

```jsx
export const version = '1.0.0';

현재 버전은 **{version}** 입니다.
```

이렇게 하면 여러 곳에서 쓰이는 값을 한 번에 수정할 수 있어 편리합니다.

---

MDX를 활용하면 단순한 텍스트 문서를 넘어, **인터랙티브하고 풍부한 문서**를 만들 수 있습니다.
다음 장에서는 Bakerywave의 API 링크 기능을 알아보겠습니다.
