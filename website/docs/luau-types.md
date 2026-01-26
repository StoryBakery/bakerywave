---
title: Luau 타입 문법
sidebar_label: Luau 타입 문법
sidebar_position: 5
---

# Luau 타입 문법

이 문서는 Luau 타입 표기 규칙을 reference 문서 작성 관점에서 요약합니다.

## 기본 타입

```lua
string
number
boolean
nil
any
unknown
```

## 함수 타입

```lua
(a: number, b: number) -> number
```

## 옵셔널 타입

```lua
string?
```

## 유니온 타입

```lua
string | number
```

## 테이블 타입

```lua
{ [string]: number }
```

## 튜플 타입

```lua
(number, string, boolean)
```

## 제네릭

```lua
<T>(value: T) -> T
```

## 타입 별칭

```lua
--- @type UserId string
```

## 인터페이스

```lua
--- @interface User
--- .id string -- 사용자 ID
--- .name string -- 사용자 이름
```

## 문서 작성 팁

- 문서용 타입 표기는 Luau 타입 문법을 그대로 사용합니다.
- 타입 표기가 비어 있으면 추론 타입을 사용하되, 지나치게 길면 요약 표시합니다.
