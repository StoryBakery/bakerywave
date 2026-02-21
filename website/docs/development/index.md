---
title: 개발 가이드
sidebar_label: 개발 가이드
sidebar_position: 2
---

# 개발 가이드 (Development Guide)

이 문서는 Bakerywave 프로젝트의 **전체적인 구조(Architecture)**를 이해하고, 개발자가 어떤 흐름으로 기여할 수 있는지 안내하는 **나침반**입니다.

:::info 먼저 확인하세요
아직 개발 환경을 구축하지 않았다면, **[개발 환경 구축 (처음부터)](./getting-started.md)** 문서를 먼저 읽고 따라해주세요.
:::

---

## 🏗️ 1. 프로젝트 구조 (Repository Structure)

Bakerywave는 **Monorepo(모노레포)** 구조를 채택하고 있습니다. 즉, 여러 개의 패키지 프로젝트가 하나의 저장소에 모여 있습니다.

가장 중요한 디렉토리는 다음과 같습니다.

### 📦 `packages/` (핵심 로직)
Bakerywave의 실제 기능이 구현된 곳입니다.

- **`bakerywave`**: CLI(Command Line Interface) 도구의 본체입니다. 사용자가 터미널에서 입력하는 명령어들이 여기 있습니다.
- **`luau-docgen`**: **Luau 분석 엔진**입니다. Rust와 C++로 작성되어 빠르고 강력합니다. `.luau` 코드를 읽어 JSON 데이터로 만듭니다.
- **`docusaurus-plugin-reference`**: Docusaurus 플러그인입니다. `docgen`이 만든 JSON 데이터를 읽어 실제 문서 페이지(`.mdx`)로 변환합니다.
- **`docs-theme`**: 문서 사이트의 디자인 테마(UI/UX)를 담당합니다. React 컴포넌트들이 들어있습니다.

### 🧪 `tests/` (테스트 환경)
개발자가 기능을 수정하고 테스트할 때 사용하는 **가상의 사용자 프로젝트**입니다.
이곳에는 `luau-module-project`라는 가짜 프로젝트가 있어서, 우리가 만든 기능이 실제 사용자 환경에서 어떻게 작동하는지 시뮬레이션할 수 있습니다.

자세한 내용은 **[로컬 테스트 환경 가이드](./tests/index.md)**에서 다룹니다.

### 📄 `website/` (공식 문서)
지금 여러분이 보고 계신 이 문서 사이트의 소스 코드입니다. 이 역시 Docusaurus로 만들어져 있습니다.

---

## 🔄 2. 개발 워크플로우 (Development Workflow)

개발은 보통 다음과 같은 흐름으로 진행됩니다.

1. **수정 (Edit)**: `packages/` 안의 코드를 수정합니다.
2. **빌드 (Build)**: 수정한 영역에 맞는 빌드/재생성을 수행합니다. (예: `luau-docgen` 네이티브 빌드, `reference:build`)
3. **검증 (Verify)**: `tests/luau-module-project`에서 명령어를 실행해 결과를 확인합니다.

어떤 부분을 수정하느냐에 따라 구체적인 절차가 달라집니다. 상세한 시나리오별 가이드는 **[로컬 테스트 환경 가이드](./tests/index.md)**를 참고하세요.

---

## 🧩 3. 개발 표준: `file:` 로컬 연동

Bakerywave 개발은 **`file:` 의존성 기반 로컬 연동**을 표준으로 사용합니다.

- 테스트 프로젝트(`tests/luau-module-project/website`)는 `@storybakery/*` 패키지를 `file:`로 연결합니다.
- 따라서 `packages/` 수정 내용이 테스트 프로젝트에 즉시 반영됩니다. (일부 항목은 별도 빌드 필요)
- `file:` 방식은 npm 표준 기능이며, 개발 중 Git 태그/배포 없이 반복 검증하기에 적합합니다.

루트 기준 실행 규칙:

- `npm run dev`: 공식 문서 사이트(`website/`) 개발 서버 실행
- `npm run dev:test`: 테스트 프로젝트(`tests/luau-module-project/website`) 개발 서버 실행

---

## 📚 4. 문서 목록 (Table of Contents)

개발자에게 필요한 문서들을 주제별로 정리했습니다.

### 🚀 시작하기
- **[개발 환경 구축](./getting-started.md)**: Node.js 필수 준비부터 첫 실행까지, 네이티브(Rust/C++) 개발 선택 경로 포함.
- **[로컬 테스트 환경](./tests/index.md)**: 변경 사항을 로컬에서 검증하는 상세한 방법.

### 🧭 심화 가이드
- **[테스트 구조 및 픽스처](./tests/fixture.md)**: 테스트 프로젝트(`tests/`)가 어떻게 구성되어 있는지 분석.
- **[테스트 시나리오](./tests/scenarios.md)**: PR 전 확인해야 할 체크리스트.
- **[문서 스타일 가이드](./style.md)**: 문서를 작성할 때 지켜야 할 규칙과 스타일.
- **[기여하기](./contributing.md)**: 오픈소스 기여 절차 및 규칙.

---

## ❓ 5. 용어 사전 (Glossary)

Bakerywave 개발 중 자주 마주칠 용어들입니다.

| 용어                  | 설명                                                             |
| :-------------------- | :--------------------------------------------------------------- |
| **Monorepo**          | 하나의 저장소에 여러 패키지가 있는 구조.                         |
| **CLI**               | 터미널에서 글자로 명령하는 인터페이스 (`bakerywave init` 등).    |
| **Luau**              | Roblox에서 사용하는 스크립트 언어. Bakerywave가 분석하는 대상.   |
| **Docusaurus**        | 문서 사이트를 만드는 정적 사이트 생성기(SSG).                    |
| **Artifact** (산출물) | 빌드 과정에서 생성되는 파일들 (예: `luau.json`, `.mdx` 파일 등). |

---

이제 **[로컬 테스트 환경 가이드](./tests/index.md)**로 이동해서 실제로 테스트를 어떻게 수행하는지 알아보세요!
