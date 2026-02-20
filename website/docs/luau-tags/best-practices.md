---
title: 작성 모범 사례
sidebar_position: 3
---

# 작성 모범 사례

읽기 좋고 유용한 문서를 만들기 위한 몇 가지 팁입니다.

## 1. 첫 줄은 요약으로
설명의 첫 번째 문장은 문서를 목록에서 볼 때 **요약(Summary)**으로 사용됩니다.
가장 핵심적인 내용을 짧고 명확하게 적으세요.

```lua
--[=[
    플레이어의 체력을 회복시킵니다. (<- 요약으로 사용됨)
    
    회복량은 플레이어의 아이템/스킬 효과에 따라 달라질 수 있습니다.
    (<- 상세 설명)
]=]
```

## 2. 마크다운 활용하기
설명 안에서 마크다운 문법을 적극적으로 활용하세요.
코드를 넣거나, 경고 문구(`<Alert>`)를 넣으면 훨씬 보기 좋아집니다.

````lua
--[=[
    데이터를 저장합니다.
    
    <Alert severity="warning">
    <AlertTitle>주의</AlertTitle>
    저장하는 동안에는 게임을 종료하지 마세요.
    </Alert>
    
    사용 예:
    ```lua
    DataStore:Save("Key", value)
    ```
]=]
````

## 3. 타입 명시하기
Luau의 장점인 정적 타입을 적극 활용하세요.
주석에 `@param`만 적는 것보다, 함수 자체에 타입(`: number`)을 적어두면 Bakerywave가 자동으로 이를 문서에 표시해줍니다.

## 4. 링크 걸기

다른 클래스나 함수를 언급할 때는 링크를 걸어주는 것이 좋습니다.
Bakerywave 문서에서는 **Roblox 공식 문서 스타일**인 백틱(`) API 링크 문법을 사용합니다.

### 권장: Roblox 스타일 (`Class.Name`)
백틱 안에 `Class.` 접두어를 붙여 클래스 이름을 적으면 자동으로 링크로 변환됩니다.

```lua
--[=[
    이 함수는 `Class.MyClass`를 반환합니다.
    `Class.MyClass:DoSomething()` 메서드를 확인하세요.
]=]
```

*   **클래스:** `` `Class.Name` `` → 해당 클래스 페이지로 연결
*   **메서드/함수:** `` `Class.Name:Method()` `` → 해당 함수의 앵커로 연결
*   **속성:** `` `Class.Name.Property` `` → 해당 속성의 앵커로 연결

### 주석 전용 단축 문법 (`[Class.Member]`, `[Class:Method]`)
레퍼런스 문서를 만드는 Luau 주석에서는 다음 단축 문법도 사용할 수 있습니다.

```lua
--[=[
    상태 값은 [DocWidgetState.Clicks]를 참고하세요.
    갱신 흐름은 [DocWidget:Refresh]를 확인하세요.
]=]
```

- `` [Class.Member] ``: 클래스 멤버(속성/이벤트/함수) 링크
- `` [Class:Method] ``: 클래스 메서드 링크
- 카테고리(`Docs.`, `Classes.` 등)를 명시하지 않아도 자동으로 대상 클래스를 탐색합니다.

moonwave link 와의 호환을 위해 구현되었으며, 백틱 링크보다 간편한 면이 있기에 내부 모듈의 클래스/멤버를 연결할 때 유용합니다.
단 주석 문서가 아닌, 일반 문서를 작성하는 경우에는 백틱 링크를 권장합니다.

**텍스트 변경하기:**
파이프(`|`)를 사용하여 링크 텍스트를 바꿀 수 있습니다.
*   `` `Class.Player|플레이어` `` → `[플레이어](...)`로 표시됨

**링크 끄기:**
링크를 걸지 않고 코드 스타일만 유지하고 싶다면 `no-link`를 사용하세요.
*   `` `Class.Player|no-link` ``

<Alert severity="info">
<AlertTitle>참고</AlertTitle>
`Class.`, `Datatype.`, `Enum.`, `Global.`, `Library.` 접두어는
Roblox 공식 문서로 링크됩니다.
`Classes.` 나 `@category {CategoryName}`로 정의된 `{CategoryName}.` 등의 접두어는 Bakerywave 문서로 링크됩니다.
</Alert>

