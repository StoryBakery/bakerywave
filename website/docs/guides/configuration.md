---
title: 환경 설정 (bakerywave.toml)
sidebar_position: 1
---

# 환경 설정 (bakerywave.toml)

Bakerywave의 핵심 설정은 프로젝트 루트의 `bakerywave.toml` 파일에서 관리합니다.

## 설정 원칙 (옵트인)

- `bakerywave.toml`에서 `site.*` 키를 지우면 해당 Bakerywave UI/네비게이션 기능도 함께 꺼집니다.
- 즉, 파일을 비우면(또는 `schemaVersion`만 남기면) Docusaurus 기본 동작에 가깝게 돌아갑니다.
- 필요한 기능만 `bakerywave.toml`에 명시적으로 추가하는 방식을 권장합니다.

## 기본 구조

```toml
schemaVersion = 1

[site.navigation]
autoNavigationFromDocsFolders = true

[site.navigation.sectionLabels]
guides = "Guides"
reference = "API"

[site.navbar]
showSearch = true
showLocaleDropdown = false

[site.search]
enabled = true
placeholder = "검색..."
shortcut = "Ctrl K"
minChars = 2

[site.search.hints]
minChars = "2글자 이상 입력하세요"
noResults = "결과가 없습니다"

[site.search.filters]
all = "전체"
guides = "Guides"
reference = "API"

[site.footer]
enabled = true
showLicense = true
showCopyright = true
showGithub = true
showPoweredBy = true

[site.locale]
enabled = false
current = "한국어"

[reference]
lang = "luau"
rootDir = "."
srcDir = "src"
outDir = "docs/reference/luau"

[i18n]
defaultLocale = "ko"
locales = ["ko", "en"]
```

## [site.navigation] 섹션
문서 폴더 구조를 기반으로 네비게이션을 자동 생성하는 옵션입니다.

| 옵션명 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `autoNavigationFromDocsFolders` | boolean | false | `docs/`의 1단 폴더를 기준으로 navbar 탭 + sidebar를 자동 생성합니다. |
| `sectionLabels` | table | - | 섹션 라벨 매핑입니다. 예: `reference = "API"` |

## [site.navbar] 섹션
Navbar 보조 UI 노출 옵션입니다.

| 옵션명 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `showSearch` | boolean | false | 검색 버튼 표시 여부입니다. |
| `showLocaleDropdown` | boolean | false | 언어 드롭다운 표시 여부입니다. |

## [site.search] 섹션
검색 기능 옵션입니다.

| 옵션명 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `enabled` | boolean | false | true일 때 검색 인덱스를 생성하고 검색 UI를 표시합니다. |
| `placeholder` | string | "검색..." | 검색창 placeholder |
| `shortcut` | string | "Ctrl K" | 단축키 표시 텍스트 |
| `minChars` | number | 2 | 최소 검색 글자 수 |
| `hints.minChars` | string | - | 최소 글자수 안내 문구 |
| `hints.noResults` | string | - | 검색 결과 없음 안내 문구 |
| `filters.*` | string | - | 섹션 필터 라벨 매핑 |

## [site.footer] 섹션
Footer 표시 옵션입니다.

| 옵션명 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `enabled` | boolean | false | true일 때 Footer를 렌더링합니다. |
| `showLicense` | boolean | true | 라이선스 표시 여부 |
| `showCopyright` | boolean | true | 저작권 표시 여부 |
| `showGithub` | boolean | true | GitHub 링크 표시 여부 |
| `showPoweredBy` | boolean | true | Powered by 문구 표시 여부 |

## [site.locale] 섹션
Locale UI 옵션입니다.

| 옵션명 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `enabled` | boolean | false | true일 때 locale 기능 UI를 사용합니다. |
| `current` | string | - | 현재 locale 표시 문자열(선택) |
| `labels.<locale>` | string | - | locale 코드별 표시 라벨 |

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

## 문서 폴더 운영 기준

- 일반 문서는 `docs/` 아래에서 폴더를 자유롭게 구성합니다.
- `guides`(또는 원하는 이름)는 일반 문서를 묶는 사이드바 그룹 이름으로 사용할 수 있습니다.
- Reference 생성물은 `outDir` 경로에 생성되며, 기본/권장 경로는 `docs/reference/<lang>`입니다.
- Reference 출력 폴더는 빌드 시 덮어써질 수 있으므로 수동 문서와 분리해 운영합니다.

## [i18n] 섹션
다국어 지원(국제화) 관련 설정입니다.

| 옵션명          | 타입   | 설명                                              |
| --------------- | ------ | ------------------------------------------------- |
| `defaultLocale` | string | 기본 언어 코드 (예: "ko", "en")                   |
| `locales`       | array  | 지원하는 모든 언어 코드 목록 (예: `["ko", "en"]`) |

설정을 변경한 후에는 **서버를 재시작**해야 적용됩니다.
