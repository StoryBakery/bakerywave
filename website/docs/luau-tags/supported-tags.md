---
title: 지원하는 태그 목록
sidebar_position: 2
---

# 지원하는 태그 목록

이 문서는 **현재 구현된 태그**만 정리합니다.
각 태그의 형식은 `<필수>`와 `[선택]` 표기를 사용합니다.

## 분류/구조 태그

### @class
클래스(또는 모듈) 문서임을 지정합니다. 

주로 파일 상단에 1회 사용합니다.
같은 파일 안에 2개 이상의 @class를 사용할 수 있지만, 표준은 1개만 입니다.

형식: `@class <ClassName>`

```lua
--[=[
    @class MyModule
    이 모듈은 예시입니다.
]=]
local MyModule = {}
```

#### 생략-패턴

생략 규칙:
- 아래 조건을 모두 만족하면 `@class`를 생략해도 됩니다.
- 파일의 **첫 문서 주석**이어야 합니다.
- 파일 시작부터 해당 주석 전까지는 **공백 줄만** 있어야 합니다.
- 주석 형태는 `--[=[ ... ]=]` 이어야 합니다.
- 해당 주석 안에는 `@class`/`@within*`/`@param` 같은 태그 없이 **설명만** 있어야 합니다.

클래스 이름 결정:
- 기본: 파일명(확장자 제외)을 클래스 이름으로 사용합니다.
- 예: `MyService.luau` -> `MyService`
- 파일명이 `init.luau`, `init.client.luau`, `init.server.luau`이면 **상위 디렉토리명**을 클래스 이름으로 사용합니다.
- 예: `Inventory/init.luau` -> `Inventory`

```lua
-- Class/init.luau
--[=[
    태그 `@class Class` 없이 Class 에 대한 문서 주석이 가능 
]=]
```

### @within
멤버가 속한 클래스를 명시합니다. 자동 추론이 어려울 때 사용합니다.

형식: `@within <ClassName>`

```lua
--[=[
    @within MyClass
    @prop Enabled boolean -- 활성화 여부
]=]
MyClass.Enabled = true
```

### @file
파일 수준 옵션 블록을 표시합니다.
보통 파일 상단에서 `@option`과 함께 사용합니다.

형식: `@file`

```lua
--[=[
    @file
    @option within.default MyClass
    @option within.require true
]=]
```

### @option
파일 수준 옵션을 설정합니다.
같은 파일에서 여러 번 사용할 수 있습니다.

형식: `@option <Key> [Value]`

지원 키:
- `within.default <ClassName>`: `@within`이 없는 멤버의 기본 소속 클래스
- `within.require [boolean]`: 자동 소속 추론 사용 여부 (`true`면 명시 `@within` 권장)

```lua
--[=[
    @file
    @option within.default MyClass
    @option within.require false
]=]
```

### @category
사이드바 폴더(카테고리)를 지정합니다. `/`로 계층을 만들 수 있습니다.

형식: `@category <Category/Path>`

```lua
--[=[
    @class Item1
    @category Items
]=]

--[=[
    @class WoodenSword
    @category Items/Weapons
]=]
```

### @group
멤버를 그룹으로 묶습니다.

원래는 Types, Constructors, Properties, Methods, Events, Functions 이렇게 사이드바에서 분류되지만,
`@group` 으로 묶으면 하나의 다른 그룹으로 묶을 수 있습니다.

형식: `@group <GroupName>`

```lua
--[=[
    @group Math
    @param a number
    @param b number
]=]
function Vector:Add(a: number, b: number)
end
```

### @extends
상속 관계를 표시합니다.

형식: `@extends <BaseClassName>`

```lua
--[=[
    @class Child
    @extends Parent
]=]
```

### @__index
클래스의 `__index` 이름을 지정합니다.

형식: `@__index <ClassName>`

```lua
--[=[
    @class MyClass
    @__index MyClass
]=]
```

## 선언 태그

### @prop
속성(멤버 변수)을 명시합니다.

형식: `@prop <Name> [Type] -- [설명]`

```lua
--[=[
    @prop Enabled boolean -- 활성화 여부
]=]
MyClass.Enabled = true
```

### @event
이벤트를 선언합니다. `@param`으로 이벤트 파라미터를 설명할 수 있습니다.

형식: `@event <Name>`

```lua
--[=[
    @event Touched
    @param other BasePart - 충돌한 파트
]=]
```

### @type
타입 별칭을 정의합니다.

형식: `@type <Name> [Type]`

```lua
--[=[
    @type UserId number
]=]
```

타입 별칭 제너릭은 선언부(`type A<T = ...>`)에서 자동으로 읽습니다.
`@param`을 함께 사용하면 타입 파라미터 설명이 `Type Parameters`로 표시됩니다.

```lua
--[=[
    @type Box { value: T }
    @param T - 값 타입
]=]
export type Box<T = number> = { value: T }
```

### @variant
유니온 타입의 항목 설명을 정의합니다.
`@type` 블록 안에서 사용하며, 여러 번 쓸 수 있습니다.

형식: `@variant <Literal> - [설명]`

```lua
--[=[
    @type HandleType "Auto" | "AutoClamped" | "Vector" | "Free" | "Aligned"

    @variant "Auto"
        양쪽 기울기를 일정하게 맞춰 자연스럽게 이어집니다.
        @default
    @variant "AutoClamped" - Auto와 같지만 오버슈트를 방지하도록 값을 클램프합니다.
    @variant "Vector" - 이전·다음 키프레임 벡터 방향으로 1/3 핸들을 만듭니다.
]=]
```

여러 줄 설명은 `@param`과 동일하게 들여쓰기 이어쓰기를 사용합니다.
`@default`가 들어간 `@variant`는 해당 항목이 기본값으로 표시됩니다.

### @interface
인터페이스를 선언합니다.

형식: `@interface <Name>`

```lua
--[=[
    @interface Status
]=]
```

### @field
인터페이스 필드를 정의합니다.

형식: `@field <Name> [Type] -- [설명]`

```lua
--[=[
    @interface Status
    @field Started string -- 진행 중
    @field Resolved string -- 완료됨
]=]
```

#### `.<field>` (인터페이스 필드 축약)
`@field` 대신 점(`.`)으로 시작하는 필드 줄을 사용할 수 있습니다.

형식: `.<Name> [Type] -- [설명]`

```lua
--[=[
    @interface Status
    .Started string -- 진행 중
    .Resolved string -- 완료됨
]=]
```

### @function
함수를 문서화합니다.

형식: `@function <Name>` 또는 `@function <Class.Name>`

```lua
--[=[
    @function Build
]=]
function Build()
end
```

### @method
메서드를 문서화합니다.

형식: `@method <Name>` 또는 `@method <Class:Method>`

```lua
--[=[
    @method Enable
]=]
function MyClass:Enable()
end
```

### @constructor
생성자를 문서화합니다.

형식: `@constructor <Name>`

```lua
--[=[
    @constructor new
]=]
function MyClass.new()
end
```

## 함수 시그니처 태그

### @param
함수 매개변수와 타입 별칭의 타입 파라미터를 설명합니다.

형식: `@param <Name> [Type] - [설명]`

```lua
--[=[
    @param a number - 첫 번째 숫자
    @param b number - 두 번째 숫자
]=]
function add(a: number, b: number)
end
```

타입 별칭에서 사용하면 제너릭 설명으로 처리됩니다.
선언부에 기본값(`T = number`)이 있으면 자동으로 기본값으로 노출됩니다.

```lua
--[=[
    @type Dictionary {[string]: T}
    @param T - 값 타입
]=]
export type Dictionary<T = string> = {[string]: T}
```

여러 줄 설명이 필요하면 다음 줄부터 들여쓰기하여 이어서 작성합니다.
들여쓰기 영역에서 `@default`를 사용하면 기본값을 표시할 수 있습니다.

```lua
--[=[
    @param recursive boolean
        재귀적으로 탐색합니다.
        여러 줄 설명이 가능합니다.
        @default false
]=]
function find(recursive: boolean)
end
```

### @return
반환값을 설명합니다.

형식: `@return [Type] - [설명]`

```lua
--[=[
    @return number - 덧셈 결과
]=]
function add(a, b)
end
```

```lua
--[=[
    @return number
        덧셈 결과입니다.
        여러 줄 설명이 가능합니다.
]=]
function add(a, b)
end
```

### @error
에러 조건을 설명합니다.

형식: `@error [Type] -- [설명]`

```lua
--[=[
    @error string -- 음수 입력 시 오류
]=]
function sqrt(x)
end
```

### @yields
함수가 실행을 일시 중단(yield)할 수 있음을 표시합니다.

형식: `@yields`

```lua
--[=[
    @yields
]=]
function waitAsync()
end
```

## 상태/가시성 태그

### @readonly
읽기 전용 속성을 표시합니다.

형식: `@readonly`

```lua
--[=[
    @prop Enabled boolean
    @readonly
]=]
MyClass.Enabled = true
```

### @private
문서에서 숨길 수 있는 멤버로 표시합니다.

형식: `@private`

### @ignore
문서 생성에서 완전히 제외합니다.

형식: `@ignore`

## 릴리스/호환성 태그

### @since
추가된 버전을 표시합니다.

형식: `@since <Version>`

```lua
--[=[
    @since 1.2.0
]=]
```

### @deprecated
지원 중단된 기능을 표시합니다.

형식: `@deprecated [Version] -- [설명]`

```lua
--[=[
    @deprecated 2.0.0 -- 더 이상 사용하지 않습니다.
]=]
```

### @unreleased
아직 공개되지 않은 기능을 표시합니다.

형식: `@unreleased`

## 실행 환경 태그

### @server
서버 전용 표시입니다.

형식: `@server`

### @client
클라이언트 전용 표시입니다.

형식: `@client`

### @plugin
플러그인 전용 표시입니다.

형식: `@plugin`

## 기타 태그

### @tag
사용자 정의 라벨입니다.

형식: `@tag <Label>`

```lua
--[=[
    @tag experimental
]=]
```

### @external
외부 리소스 링크를 기록합니다.

형식: `@external <Name> <URL>`

```lua
--[=[
    @external RobloxBasePart https://create.roblox.com/docs/reference/engine/classes/BasePart
]=]
```

### @inheritDoc
다른 심볼의 문서를 상속합니다.

형식: `@inheritDoc <QualifiedName>`

```lua
--[=[
    @inheritDoc MyClass:BaseMethod
]=]
```

### @include
추가 포함 정보를 기록합니다.

형식: `@include <Value>`

### @snippet
스니펫 이름을 기록합니다.

형식: `@snippet <Name>`

### @alias
별칭 정보를 기록합니다.

형식: `@alias <Name>`

> `@include`, `@snippet`, `@alias`, `@external`은 현재 태그로만 기록되며,
> 렌더링에 별도 반영은 하지 않습니다.
