---
title: 환경 설정 (bakerywave.toml)
sidebar_position: 1
---

# 환경 설정 (bakerywave.toml)

Bakerywave의 핵심 설정은 프로젝트 루트의 `bakerywave.toml` 파일에서 관리합니다.

## 기본 구조

```toml
schemaVersion = 1

[reference]
lang = "luau"
rootDir = "."
srcDir = "src"
outDir = "docs/reference/luau"

[i18n]
defaultLocale = "ko"
locales = ["ko", "en"]
```

## [reference] 섹션
Luau API 문서 생성과 관련된 설정입니다.

| 옵션명           | 타입    | 기본값 | 설명                                                                                            |
| ---------------- | ------- | ------ | ----------------------------------------------------------------------------------------------- |
| `lang`           | string  | "luau" | 언어 종류입니다. 현재는 "luau"만 지원합니다.                                                    |
| `enabled`        | boolean | true   | false로 설정하면 레퍼런스 문서를 생성하지 않습니다.                                             |
| `rootDir`        | string  | "."    | 프로젝트 루트 디렉토리 경로입니다.                                                              |
| `srcDir`         | string  | "src"  | 분석할 소스 코드가 들어있는 폴더입니다.                                                         |
| `typesDir`       | string  | -      | 공유 타입 정의 파일(.d.json 등)이 있는 폴더입니다. (선택사항)                                   |
| `outDir`         | string  | -      | 생성된 마크다운(.mdx) 파일이 저장될 경로입니다. 보통 `docs/reference` 아래로 설정합니다.        |
| `input`          | string  | (자동) | `luau-docgen`이 생성한 JSON 데이터 경로입니다. 기본값은 `.generated/reference/luau.json`입니다. |
| `includePrivate` | boolean | false  | `@private` 태그가 붙은 요소도 문서에 포함할지 여부입니다.                                       |
| `clean`          | boolean | true   | 문서를 새로 생성하기 전에 `outDir`의 기존 파일을 지울지 여부입니다.                             |

## [i18n] 섹션
다국어 지원(국제화) 관련 설정입니다.

| 옵션명          | 타입   | 설명                                              |
| --------------- | ------ | ------------------------------------------------- |
| `defaultLocale` | string | 기본 언어 코드 (예: "ko", "en")                   |
| `locales`       | array  | 지원하는 모든 언어 코드 목록 (예: `["ko", "en"]`) |

설정을 변경한 후에는 **서버를 재시작**해야 적용됩니다.
