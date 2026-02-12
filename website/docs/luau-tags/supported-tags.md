---
title: 지원하는 태그 목록
sidebar_position: 2
---

# 지원하는 태그 목록

이 문서는 **현재 구현된 태그**만 정리합니다.
각 태그의 형식은 `<필수>`와 `[선택]` 표기를 사용합니다.

## 분류/구조 태그

### @class
클래스(또는 모듈) 문서임을 지정합니다. 파일 상단에 1회 사용합니다.

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

### @withinDefault
파일 내 기본 소속 클래스를 지정합니다.
이후 `@within`이 없는 멤버는 기본값으로 연결됩니다.

형식: `@withinDefault <ClassName>`

```lua
--[=[
    @class MyClass
    @withinDefault MyClass
]=]
local MyClass = {}
```

### @withinRequire
자동 소속 추론을 끄고, `@within`을 명시적으로 쓰도록 합니다.

형식: `@withinRequire`

```lua
--[=[
    @withinRequire
]=]
```

### @category
사이드바 폴더(카테고리)를 지정합니다. `/`로 계층을 만들 수 있습니다.

형식: `@category <Category/Path>`

```lua
--[=[
    @class Weapon
    @category Items/Weapons
]=]
```

### @group
멤버를 그룹 섹션으로 묶습니다.

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
    @param other BasePart -- 충돌한 파트
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

### `.<field>` (인터페이스 필드 축약)
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
매개변수를 설명합니다.

형식: `@param <Name> [Type] -- [설명]`

```lua
--[=[
    @param a number -- 첫 번째 숫자
    @param b number -- 두 번째 숫자
]=]
function add(a: number, b: number)
end
```

여러 줄 설명이 필요하면 `-- [[` 블록을 사용할 수 있습니다.
블록 안에서 `@default`를 사용하면 기본값을 표시할 수 있습니다.

```lua
--[=[
    @param recursive boolean -- [[
        재귀적으로 탐색합니다.
        여러 줄 설명이 가능합니다.
        @default false
    ]]
]=]
function find(recursive: boolean)
end
```

### @return
반환값을 설명합니다.

형식: `@return [Type] -- [설명]`

```lua
--[=[
    @return number -- 덧셈 결과
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
