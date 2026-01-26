---
title: Luau 태그
sidebar_label: Luau 태그
sidebar_position: 4
---

# Luau 태그

이 문서는 Moonwave 호환 주석/태그 규칙을 기준으로 작성되었습니다.

## Doc comment 형식

아래 형식 중 하나를 사용합니다.

```lua
--- @class MyClass
--- 설명을 여기에 작성한다.
```

```lua
--[=[
	@class MyClass
	설명을 여기에 작성한다.
]=]
```

## Doc comment 타입

doc comment 타입은 기본적으로 AST 바인딩 결과로 결정됩니다.
타입 태그는 코드에 없는 가상 멤버나 override 문서화에 사용합니다.

| 타입 태그 | 설명 |
| --- | --- |
| `@class <name>` | 클래스 문서 |
| `@prop <name> <type>` | 프로퍼티 문서 |
| `@type <name> <type>` | 타입 별칭 문서 |
| `@interface <name>` | 인터페이스 문서 |
| `@function <name>` | 정적 함수 문서 |
| `@method <name>` | 메서드 문서 |

## 소속 규칙

`@class`가 아닌 doc comment는 기본적으로 `@within <class>`가 필요합니다.

## Short link

아래 형식을 지원합니다.

- `[ClassName]`
- `[ClassName:method]`
- `[ClassName.member]`

## 태그 목록

| 태그 | 설명 |
| --- | --- |
| `@within <class>` | 소속 클래스 지정 |
| `@yields` | yielding 함수 표시 |
| `@param <name> [type] -- [description]` | 파라미터 설명 |
| `@return <type> -- [description]` | 반환값 설명 |
| `@error <type> -- [description]` | 오류 타입 설명 |
| `@tag <name>` | 태그 라벨 |
| `@unreleased` | 미출시 항목 표시 |
| `@since <version>` | 도입 버전 |
| `@deprecated <version> -- [description]` | 폐기 표시 |
| `@server` | 서버 전용 |
| `@client` | 클라이언트 전용 |
| `@plugin` | 플러그인 전용 |
| `@private` | 비공개 표시 |
| `@ignore` | 문서에서 제외 |
| `@readonly` | 읽기 전용 프로퍼티 |
| `@__index <name>` | 클래스 인덱스 테이블 지정 |
| `@external <name> <url>` | 외부 타입 링크 등록 |

## 멀티라인 설명

`@param`, `@return`, `@error`는 들여쓰기 continuation을 지원합니다.

```lua
--- @param path string -- 로드할 경로
---   - 상대/절대 경로 모두 지원한다.
---   - 실패 시 nil과 에러를 반환한다.
```

연결 규칙은 아래와 같습니다.

- 다음 줄이 2칸 이상 들여쓰기이며 첫 문자가 `@` 또는 `.`가 아니면 continuation으로 누적한다.
- 다음 태그 라인 또는 들여쓰기 없는 description 라인이 나오면 종료한다.
- fenced code block 내부에서는 `@`를 태그로 해석하지 않는다.

## 호환 제약

- `@param`은 실제 파라미터와 1:1로 대응해야 합니다.
- `@return`을 하나라도 쓰면 모든 반환값을 `@return`으로 명시합니다.
- `@readonly`는 `@prop`에서만 유효합니다.
- 타입 문자열은 Luau 타입 파서로 검증합니다.

## 확장 태그

아래 태그는 확장 규칙으로 지원할 수 있습니다.

| 태그 | 설명 |
| --- | --- |
| `@inheritDoc <QualifiedName>` | 대상 문서를 상속/병합 |
| `@include <fragmentId>` | 문서 조각 삽입 |
| `@snippet <path> [region]` | 코드/문서 조각 삽입 |
| `@alias <name>` | 링크/검색 별칭 추가 |
