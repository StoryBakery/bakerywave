---
title: bakerywave 설정
sidebar_label: bakerywave 설정
sidebar_position: 3
---

# bakerywave 설정

bakerywave는 프로젝트 루트 또는 `website/`에서 `bakerywave.toml`을 찾아 reference 설정을 불러옵니다.

## 설정 파일 위치

탐색 순서는 다음과 같습니다.

1. `website/bakerywave.toml`
2. `<projectRoot>/bakerywave.toml`

`projectRoot`는 `siteDir`가 `website`인 경우 `website/..`로 계산됩니다.

## [reference] 섹션

현재 사용되는 설정은 `[reference]` 섹션입니다.

| 키 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| lang | string | `"luau"` | 언어 식별자 |
| rootDir | string | `siteDir/..` 또는 `cwd` | 소스 루트 디렉터리 |
| srcDir | string | `"src"` | Luau 소스 디렉터리 |
| typesDir | string | 없음 | 타입 정의 디렉터리 |
| input | string | `website/.generated/reference/<lang>.json` | reference JSON 경로 |
| outDir | string | `website/docs/reference/<lang>` | 생성된 MDX 출력 경로 |
| manifestPath | string | `website/.generated/reference/manifest.json` | manifest 경로 |
| renderMode | string | `"mdx"` | 렌더링 모드 |
| clean | boolean | `true` | manifest 기반 정리 수행 여부 |
| includePrivate | boolean | `false` | `@private` 항목 포함 여부 |

## 경로 해석 규칙

- `rootDir`, `input`, `outDir`, `manifestPath`는 `bakerywave.toml`이 있는 위치 기준으로 해석됩니다.
- `srcDir`, `typesDir`는 `rootDir` 기준으로 해석됩니다.

## 예시

```toml
[reference]
lang = "luau"
rootDir = "."
srcDir = "src"
input = "website/.generated/reference/luau.json"
outDir = "website/docs/reference/luau"
manifestPath = "website/.generated/reference/manifest.json"
renderMode = "mdx"
clean = true
```

## 주의 사항

- `renderMode`가 `mdx`가 아니면 reference 생성이 건너뛰어집니다.
- `clean = true`일 때는 manifest에 없는 파일을 정리합니다.
