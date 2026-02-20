---
title: API 링크 (백틱 문법)
sidebar_label: API Links
description: Bakerywave의 API 및 클래스로 연결하는 백틱 링크 문법을 알아봅니다.
---

# API 링크 (백틱 문법)

문서를 작성하다 보면 특정 클래스나 API, 혹은 내부 문서로 링크를 걸어야 할 때가 자주 있습니다.
Bakerywave는 이를 쉽게 해결하기 위해 **백틱 링크(Backtick Links)** 기능을 제공합니다. (흔히 "백링크"라고도 부릅니다)

## 기본 원칙

Markdown의 인라인 코드 문법인 백틱(`` ` ``) 안에 특정 접두어(`Prefix.`)를 포함하면, 빌드 시 자동으로 해당 문서 링크로 변환됩니다.

## 주요 접두어 (Prefixes)

### 1. Roblox API 링크

Roblox 엔진의 공식 API로 연결할 때 사용합니다.

| 접두어      | 설명           | 예시                    |
| ----------- | -------------- | ----------------------- |
| `Class.`    | 클래스         | `` `Class.Part` ``      |
| `Datatype.` | 데이터 타입    | `` `Datatype.CFrame` `` |
| `Enum.`     | 열거형         | `` `Enum.Material` ``   |
| `Global.`   | 전역 함수/변수 | `` `Global.print` ``    |
| `Library.`  | 라이브러리     | `` `Library.math` ``    |

### 2. Bakerywave 내부 API 링크

Bakerywave 프로젝트 내의 API 문서로 연결할 때 사용합니다.

| 접두어             | 설명        | 예시                                      |
| ------------------ | ----------- | ----------------------------------------- |
| `Classes.`         | 내부 클래스 | `` `Classes.MyClass` ``                   |
| `AnotherCategory.` | 내부 문서   | `` `AnotherCategory.Features.Overview` `` |


## 상세 연결 방법

단순히 클래스 이름뿐만 아니라, 특정 메서드나 속성으로 직접 연결할 수도 있습니다.

- **클래스 전체**: `` `Class.Part` `` → Part 클래스 페이지
- **메서드/함수**: `` `Class.Part:Destroy()` `` → Part의 Destroy 함수 설명 위치
- **속성 (Property)**: `` `Class.Part.Transparency` `` → Part의 Transparency 속성 설명 위치

## 링크 텍스트 변경하기

기본적으로는 `Part.Transparency` 처럼 경로가 그대로 링크 텍스트가 됩니다.
하지만 다른 텍스트로 보이고 싶다면 `|` (파이프) 기호를 사용하세요.

- 문법: `` `Class.Part|파트` ``
- 결과: [파트](https://create.roblox.com/docs/reference/engine/classes/Part) (링크는 Part로 걸리지만, 텍스트는 '파트'로 표시됨)

## 링크 자동 변환 끄기

만약 백틱 안에 `Class.` 같은 텍스트를 링크 없이 그대로 보여주고 싶다면 어떻게 해야 할까요?
`monospace|` 접두어나 `no-link` 옵션을 사용할 수 있습니다.

- `` `monospace|Class.Part` `` → 링크 없이 `Class.Part` 텍스트만 코드 스타일로 표시

---

이 기능을 활용하면 긴 URL을 직접 입력할 필요 없이, 간결하게 API 레퍼런스를 참조할 수 있습니다.


## moonwave-레거시-링크-문법

- 문서 링크는 Roblox 공식 스타일의 **백틱 API 링크 문법**을 사용합니다.
- 예: `` `Class.Part` ``, `` `Datatype.CFrame` ``, `` `Docs.Features.MyClass` ``
- 일반 문서(.md/.mdx)에서는 Moonwave 스타일 short link(`` `[Name]` ``)를 지원하지 않습니다.
- 단, Luau 주석에서 생성되는 Reference 설명에서는 `` [Class.Member] `` / `` [Class:Method] `` 단축 문법을 사용할 수 있습니다.
