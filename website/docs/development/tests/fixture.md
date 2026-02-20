---
title: 테스트 구조 및 픽스처
sidebar_label: 구조 및 픽스처
sidebar_position: 2
---

# 테스트 구조 및 픽스처 (Test Fixtures)

이 문서는 `tests/` 폴더 안이 어떻게 구성되어 있는지, 그리고 왜 이렇게 만들어졌는지 설명합니다.

---

## 1. 픽스처(Fixture)란?

픽스처란 **테스트를 위해 미리 준비된 고정물**을 의미합니다.
우리는 `tests/luau-module-project` 폴더 전체를 하나의 거대한 픽스처로 사용합니다.

마치 연극 무대 세트처럼, **"사용자가 Bakerywave를 사용하는 완벽한 환경"**을 세트장으로 꾸며놓은 것입니다.

---

## 2. 디렉토리 상세 구조

`tests/luau-module-project` 안을 들여다보면 다음과 같습니다.

### `src/` (가짜 소스 코드)
이곳에는 실제 게임 로직이 들어있는 게 아니라, **문서 생성 기능을 테스트하기 위한 온갖 종류의 Luau 코드**가 들어있습니다.

- `Example.luau`, `Showcase.luau`: 기본 문서 생성 흐름 테스트용
- `AdvancedTypes.luau`, `TypeInfos.luau`: 복잡한 타입/시그니처 테스트용
- `AutoInitClass/init.luau`: 디렉토리 기반 모듈 구조 테스트용

여러분이 "이런 이상한 코드도 문서화가 잘 될까?" 궁금하다면, 여기에 파일을 추가하고 주석을 달아보면 됩니다.

### `website/` (가짜 문서 사이트)
사용자가 `bakerywave init`으로 만들었을 법한 Docusaurus 사이트입니다.

- `docusaurus.config.js`: Bakerywave 설정이 적용되어 있습니다.
- `package.json`: 로컬에 있는 `bakerywave` 패키지를 참조하도록 설정되어 있습니다.

### `bakerywave.toml` (설정 파일)
Bakerywave가 어떻게 동작할지 정의하는 설정 파일입니다. 입력 경로(`src/`)와 출력 경로(`website/`)가 지정되어 있습니다.

---

## 3. 테스트의 원리

우리의 테스트는 **End-to-End (E2E) 통합 테스트** 방식에 가깝습니다.

1. **입력**: `src/` 폴더의 Luau 파일들
2. **처리**: Bakerywave 엔진 실행 (분석 -> 데이터 추출 -> 변환)
3. **출력**: `website/docs/reference/luau/` 폴더에 생성된 MDX 파일들
4. **검증**: Docusaurus가 이 MDX 파일들을 에러 없이 HTML로 빌드할 수 있는지 확인

이 모든 과정이 에러 없이 끝나야 "테스트 통과"입니다.

---

## 4. 직접 픽스처 추가하기

새로운 기능을 개발했다면 테스트할 데이터(픽스처)도 추가해야 합니다.

1. **Luau 기능 테스트**: `tests/luau-module-project/src/` 안에 새 `.luau` 파일을 만드세요.
2. **문서 기능 테스트**: `tests/luau-module-project/website/docs/` 안에 새 `.md` 또는 `.mdx` 파일을 만드세요.
3. **설정 테스트**: `bakerywave.toml` 수정을 시도해보세요.

변경 후에는 반드시 아래 명령어로 결과물을 확인하세요.

```bash
npm --prefix tests/luau-module-project/website run reference:build
```
