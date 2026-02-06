---
title: Docgen 스크립트 포맷
sidebar_position: 4
---

# Docgen 스크립트 포맷

이 문서는 `customDocConfig`로 연결되는 **Luau/JSON 스크립트의 반환 포맷**을 설명합니다.
docgen 스크립트는 문서 주석으로 표현하기 어려운 정보를 **추가 주입**하기 위한 용도입니다.

## 연결 방법

`bakerywave.toml`의 `reference.customDocConfig`에 경로를 지정합니다.

```toml
[reference]
customDocConfig = "website/luau-docgen-scripts"
```

경로가 **폴더**라면 내부의 `.luau`, `.lua`, `.json` 파일을 모두 읽어 병합합니다.
정렬 기준은 **파일명 오름차순**입니다.

## 실행 방식

- `.luau`, `.lua` 파일은 `lune`으로 실행됩니다.
- `lune`이 없으면 해당 파일은 **경고 후 스킵**됩니다.
- `.json` 파일은 그대로 파싱됩니다.

## 최상위 반환 테이블

스크립트는 **테이블**을 반환해야 합니다. 가능한 키는 아래와 같습니다.

```lua
return {
    classes = {
        {
            name = "DocgenShowcase",
            category = "Showcase/Advanced",
            description = "docgen 스크립트에서 직접 제공하는 문서 심볼입니다.",
            props = {
                { name = "Version", type = "string", readonly = true, description = "문서 버전" },
            },
            methods = {
                {
                    name = "Parse",
                    params = {
                        { name = "input", type = "string", description = "입력 문자열" },
                    },
                    returns = {
                        { type = "boolean", description = "파싱 성공 여부" },
                    },
                    errors = {
                        { type = "string", description = "파싱 실패 이유" },
                    },
                    description = "입력을 파싱합니다.",
                },
            },
            events = {
                {
                    name = "Changed",
                    params = {
                        { name = "field", type = "string" },
                        { name = "value", type = "any" },
                    },
                    description = "값이 바뀌었을 때 발생합니다.",
                },
            },
            interfaces = {
                {
                    name = "ParseOptions",
                    fields = {
                        { name = "strict", type = "boolean", description = "엄격 모드" },
                        { name = "limit", type = "number?", description = "최대 길이" },
                    },
                    description = "Parse 옵션입니다.",
                },
            },
            types = {
                {
                    name = "HTTP Status",
                    type = "\"OK\" | \"NotFound\" | \"ServerError\"",
                    description = "문서 주석으로 정의하기 어려운 타입 이름 예시입니다.",
                },
            },
            groups = {
                ["기타"] = {
                    methods = {
                        {
                            name = "Dump",
                            returns = { { type = "string" } },
                            description = "디버그 문자열을 반환합니다.",
                        },
                    },
                    types = {
                        {
                            name = "DebugMode",
                            type = "\"Off\" | \"On\"",
                        },
                    },
                },
            },
        },
    },
}
```

### `classes` (기본)

**여러 클래스에 타입을 나눠서 주입**할 수 있습니다.
이 방식이 기본이며, **한 클래스만 있어도 배열로 감싸야 합니다.**

생성 규칙:
- `classes`의 각 항목은 기본적으로 **클래스 페이지 1개**를 만듭니다.
- 따라서 `DocgenTypes`를 넣으면 `.../DocgenTypes` 페이지가 생성됩니다.
- 기존 클래스 페이지(예: `.../AdvancedTypes`)에 멤버만 추가하려면 멤버에 `within = "AdvancedTypes"`를 지정합니다.

클래스 필드:
- `name`: 클래스 이름
- `category`: 카테고리 (선택)
- `description`: 클래스 설명 (선택)
- `group`: 이 클래스에서 선언한 멤버들의 기본 그룹 (선택)
- `tags`: 클래스 태그 배열 (선택)
- `props` / `properties`: 속성 배열 (선택)
- `methods`: 메서드 배열 (선택)
- `events`: 이벤트 배열 (선택)
- `interfaces`: 인터페이스 배열 (선택)
- `types`: 타입 배열
- `groups`: 그룹 단위 멤버 묶음 (선택)

타입 필드:
- `name`: 타입 이름
- `type`: 타입 표현 문자열
- `description`: 설명 (선택)
- `within`: 대상 클래스 이름 (선택, 기본값은 현재 클래스)

공통 멤버 필드 (`props`, `methods`, `events`, `interfaces`, `types`):
- `name`: 멤버 이름
- `description`: 멤버 설명 (선택)
- `within`: 소속 클래스 이름 (선택, 기본값은 현재 클래스)
- `group`: 멤버 그룹명 (선택, 예: `Core`, `Events`, `기타`)
- `tags`: 추가 태그 배열 (선택)

`props` 전용 필드:
- `type`: 속성 타입
- `readonly`: 읽기 전용 여부 (선택)

`methods` / `events` 전용 필드:
- `params`: 파라미터 배열 (선택)
- `returns`: 반환 배열 (선택)
- `errors`: 에러 배열 (선택)
- `yields`: `@yields` 배지 표시 여부 (선택)
- `return`/`error` 단수 키는 지원하지 않습니다. 항상 배열 키(`returns`, `errors`)를 사용합니다.

`params` 필드:
- `name`: 파라미터 이름
- `type`: 파라미터 타입
- `description`: 설명 (선택)
- `default`: 기본값 (선택)

`interfaces` 전용 필드:
- `fields`: 인터페이스 필드 배열

`fields` 필드:
- `name`: 필드 이름
- `type`: 필드 타입
- `description`: 설명 (선택)

`groups` 필드:
- 임의 이름의 그룹 키를 만들 수 있습니다. 예: `groups = { ["기타"] = { ... } }`
- 그룹 안에서 `props/methods/events/interfaces/types`를 그대로 작성할 수 있습니다.
- 그룹에 넣은 멤버는 해당 그룹명이 자동으로 적용됩니다.

예시:
```lua
return {
    classes = {
        {
            name = "RenderTypes",
            methods = {
                {
                    name = "Draw",
                    params = {
                        { name = "dt", type = "number" },
                    },
                    returns = {
                        { type = "boolean" },
                    },
                },
            },
            events = {
                {
                    name = "Ready",
                    params = {
                        { name = "ok", type = "boolean" },
                    },
                },
            },
            interfaces = {
                {
                    name = "DrawOptions",
                    fields = {
                        { name = "quality", type = "\"low\" | \"high\"" },
                    },
                },
            },
            props = {
                { name = "Enabled", type = "boolean", readonly = true },
            },
            types = {
                {
                    name = "3D Vector (Normalized)",
                    type = "{ x: number, y: number, z: number, magnitude: 1 }",
                    description = "공백/괄호가 포함된 이름 예시입니다.",
                },
            },
        },
    },
}
```

## 폴더 구성 예시

```
website/
  luau-docgen-scripts/
    custom-types.luau
```

각 파일이 반환한 테이블은 **병합**됩니다.
같은 배열 키(`classes`)는 **이어 붙이기**로 합쳐집니다.

## 스크립트 예시 (Luau)

`src` 모듈을 require해서 변환하는 예시:

```lua
local source = require("../../src/DocgenTypeAnnotations")

local mapped = {}
for _, entry in ipairs(source) do
    table.insert(mapped, {
        name = entry.Name,
        type = entry.TypeAnnotation,
        description = entry.Description,
    })
end

return {
    classes = {
        {
            name = "DocgenTypes",
            category = "Showcase/Advanced",
            types = mapped,
        },
        {
            name = "DocgenMembers",
            methods = {
                {
                    name = "Resolve",
                    params = {
                        { name = "path", type = "string" },
                    },
                    returns = {
                        { type = "boolean" },
                    },
                },
            },
            groups = {
                ["기타"] = {
                    events = {
                        {
                            name = "Resolved",
                            params = {
                                { name = "path", type = "string" },
                            },
                        },
                    },
                },
            },
        },
    },
}
```
