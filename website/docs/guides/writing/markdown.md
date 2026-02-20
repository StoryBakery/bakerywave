---
title: Markdown 기본 문법
sidebar_label: Markdown Syntax
description: 문서를 작성하기 위한 기본적인 Markdown 문법을 알아봅니다.
---

# Markdown 기본 문법

Bakerywave 문서는 **Markdown(.md)** 형식을 기반으로 작성됩니다.
Bakerywave에서는 `.md` 파일도 **MDX 문법으로 처리**되므로, Markdown 문법과 React 컴포넌트를 함께 사용할 수 있습니다.
이 문서는 자주 사용되는 Markdown/MDX 작성법을 초보자도 쉽게 따라할 수 있도록 구성했습니다.

## 제목 (Headings)

제목은 문서의 구조를 잡는 가장 중요한 요소입니다. `#` 기호를 사용하여 제목 크기를 조절합니다.

```markdown
# 이것은 가장 큰 제목입니다 (h1)
## 이것은 두 번째로 큰 제목입니다 (h2)
### 이것은 세 번째로 큰 제목입니다 (h3)
#### 이것은 네 번째로 큰 제목입니다 (h4)
```

**권장 사항:**
- 문서 제목은 파일의 `title` 속성(Frontmatter)으로 설정되므로, 본문에서는 주로 `##` (h2)부터 사용하세요.
- 계층 구조를 명확히 하여 읽기 쉽게 만드세요.

## 텍스트 스타일 (Text Styles)

텍스트를 강조하거나 기울임꼴을 적용할 수 있습니다.

```markdown
**굵게 강조** (Bold)
*기울임꼴* (Italic)
`인라인 코드` (Inline Code)
~~취소선~~ (Strikethrough)
```

- **굵게 강조**: `**텍스트**`
- *기울임꼴*: `*텍스트*`
- `인라인 코드`: `` `텍스트` `` (짧은 코드나 명령어를 언급할 때 유용)
- ~~취소선~~: `~~텍스트~~`

## 목록 (Lists)

### 순서 없는 목록 (Unordered List)

`-`, `*`, `+` 기호를 사용하여 순서 없는 목록을 만들 수 있습니다.

```markdown
- 항목 1
- 항목 2
  - 들여쓰기된 항목 2-1
  - 들여쓰기된 항목 2-2
```

### 순서 있는 목록 (Ordered List)

숫자와 점(`1.`)을 사용하여 순서 있는 목록을 만듭니다.

```markdown
1. 첫 번째 단계
2. 두 번째 단계
3. 세 번째 단계
```

## 코드 블록 (Code Blocks)

여러 줄의 코드를 작성할 때는 백틱 3개(```)를 사용합니다. 언어를 지정하면 문법 강조(Syntax Highlighting)가 적용됩니다.

````markdown
```lua
local function hello()
    print("Hello, Bakerywave!")
end
```
````

## 링크 (Links)

다른 웹페이지나 문서로 연결할 때 사용합니다.

```markdown
[Bakerywave 공식 문서](https://bakerywave.com)
[내부 문서 링크](./other-doc.md)
```

## 인용문 (Blockquotes)

다른 텍스트를 인용하거나 참고 사항을 적을 때 유용합니다.

```markdown
> 이것은 인용문입니다.
> 여러 줄을 쓸 수도 있습니다.
```

## 표 (Tables)

데이터를 표 형태로 정리할 수 있습니다.

```markdown
| 이름   | 설명        |
| ------ | ----------- |
| Bakery | 맛있는 빵   |
| Wave   | 시원한 파도 |
```

| 이름   | 설명        |
| ------ | ----------- |
| Bakery | 맛있는 빵   |
| Wave   | 시원한 파도 |

## Markdown 파일에서 MDX 사용하기

`.md` 파일 안에서도 JSX 형태의 컴포넌트를 사용할 수 있습니다.

### Alert 컴포넌트

알림 박스는 `<Alert>`를 사용합니다.

```mdx
<Alert severity="info">
<AlertTitle>정보</AlertTitle>
이것은 정보 메시지입니다.
</Alert>
```

`severity`는 아래 값 중 하나를 사용합니다.

- `error`
- `info`
- `success`
- `warning`

### 탭 (Tabs)

탭 UI도 문서 안에서 바로 사용할 수 있습니다.

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

### JSX/변수 사용

변수 정의 및 JSX 표현식도 사용할 수 있습니다.

```mdx
export const version = '1.0.0';

현재 버전은 **{version}** 입니다.
```

---

이제 기본적인 Markdown/MDX 작성법을 익혔습니다.
추가 예시가 필요하면 [MDX 가이드](./mdx)도 함께 참고하세요.
