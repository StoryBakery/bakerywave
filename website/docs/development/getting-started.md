---
title: 개발 환경 구축 (처음부터)
sidebar_label: 시작하기
sidebar_position: 1
---

# 개발 환경 구축 (처음부터)

이 문서는 Bakerywave를 **처음 개발하는 사람**을 위해 작성되었습니다.
아래 가이드를 순서대로 따라 하면, 내 컴퓨터에 Bakerywave를 설치하고 실행할 수 있습니다.

목표:
1. 필요한 도구들을 설치한다.
2. 소스 코드를 다운로드(Clone)한다.
3. 내 컴퓨터에서 실행해본다.

---

## 1단계: 필수 도구 설치 (Prerequisites)

Bakerywave는 웹 기술(Node.js)과 시스템 언어(Rust, C++)를 혼합하여 사용합니다.
따라서 다음 도구들이 모두 설치되어 있어야 합니다.

### 🛠️ 도구 목록 및 다운로드

| 도구 이름              | 설명 (이걸 왜 쓰나요?)                                                                                        | 다운로드 링크                                                                           |
| :--------------------- | :------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------- |
| **Node.js** (LTS 버전) | 자바스크립트 실행기입니다. 웹사이트와 CLI를 실행할 때 필요합니다.                                             | [다운로드 (nodejs.org)](https://nodejs.org/)                                            |
| **Rust** (+ Cargo)     | 매우 빠른 시스템 프로그래밍 언어입니다. Bakerywave의 문서 분석 엔진(`luau-docgen`)이 이것으로 만들어졌습니다. | [설치 방법 (rust-lang.org)](https://www.rust-lang.org/tools/install)                    |
| **CMake**              | C++ 코드를 빌드하기 위한 도구입니다. Luau 분석기를 컴파일할 때 필요합니다.                                    | [다운로드 (cmake.org)](https://cmake.org/download/)                                     |
| **C++ Build Tools**    | 실제 컴파일러입니다. Windows에서는 **Visual Studio Build Tools**가 필요합니다.                                | [설치 방법 (Visual Studio)](https://visualstudio.microsoft.com/visual-cpp-build-tools/) |

### ⚠️ Windows 사용자 주의사항
Windows에서는 **Visual Studio Build Tools** 설치 시 **"C++를 사용한 데스크톱 개발 (Desktop development with C++)"** 워크로드를 반드시 체크해야 합니다.

### 설치 확인
터미널(PowerShell 또는 CMD)을 열고 다음 명령어를 입력하여 버전이 잘 뜨는지 확인하세요.

```bash
node -v
# v18.x.x 이상 권장

cargo --version
# cargo 1.x.x

cmake --version
# cmake version 3.x.x
```

> **오류가 발생하나요?**  
> 설치 후 터미널을 **껐다가 다시 켜야** 환경 변수가 적용됩니다. 그래도 안 된다면 재부팅을 해보세요.

---

## 2단계: 소스 코드 가져오기 (Clone)

필요한 도구가 준비되었으니, 이제 Bakerywave의 코드를 내 컴퓨터로 가져옵니다.

1. 터미널을 엽니다.
2. 코드를 저장할 폴더로 이동합니다.
3. 다음 명령어를 입력합니다.

```bash
# GitHub 저장소를 내 컴퓨터로 복제합니다.
git clone https://github.com/storybakery/bakerywave.git

# 복제된 폴더 안으로 들어갑니다.
cd bakerywave
```

> **Git이 없나요?**  
> [Git 다운로드](https://git-scm.com/downloads)에서 설치하세요. Git은 코드 버전을 관리하는 도구입니다.

---

## 3단계: 의존성 설치 (Install Dependencies)

코드를 실행하려면 이 프로젝트가 사용하는 외부 라이브러리(Dependencies)를 다운로드해야 합니다.

```bash
# 1. Bakerywave 전체 프로젝트의 의존성을 설치합니다.
npm install

# 2. 우리가 테스트용으로 사용할 '가짜 프로젝트'의 의존성도 설치합니다.
npm --prefix tests/luau-module-project/website install
```

이 과정은 인터넷 속도에 따라 몇 분 정도 걸릴 수 있습니다.

### 개발 표준: `file:` 로컬 연동

Bakerywave는 개발 단계에서 **`file:` 의존성 기반 로컬 연동**을 표준으로 사용합니다.
`tests/luau-module-project/website/package.json`이 `@storybakery/*` 패키지를 `file:`로 참조하기 때문에, `packages/`에서 수정한 내용이 테스트 프로젝트에 바로 반영됩니다.
(단, Rust 네이티브 변경 등은 별도 빌드가 필요합니다.)

외부 프로젝트에 로컬 Bakerywave를 연결하는 구체적인 절차는
**[로컬 테스트 환경 가이드](./tests/index.md)**의 `1.4 file: 연동 실제 설정 방법`을 참고하세요.

---

## 4단계: 첫 실행 (Build & Run)

이제 모든 준비가 끝났습니다! Bakerywave가 제대로 동작하는지 확인해 봅시다.

우리는 **테스트용 가짜 프로젝트**(`tests/luau-module-project`)를 실행해서 확인합니다.

### 1. 레퍼런스 데이터 생성
가장 먼저, Luau 소스 코드를 읽어서 문서 데이터로 변환해야 합니다. 이 작업은 Rust로 만든 엔진이 수행합니다.

```bash
npm --prefix tests/luau-module-project/website run reference:build
```

터미널에 뭔가 복잡한 로그가 뜨고, 마지막에 `✨ Done!` 같은 메시지가 나오면 성공입니다.

### 2. 개발 서버 실행
이제 웹사이트를 띄웁니다.

```bash
npm --prefix tests/luau-module-project/website run dev
# 또는 루트 단축 스크립트
# npm run dev:test
```

잠시 기다리면 터미널에 다음과 같은 메시지가 뜹니다.

> `[SUCCESS] Docusaurus website is running at: http://localhost:3000/`

웹 브라우저를 열고 `http://localhost:3000` 주소로 접속해 보세요. Bakerywave 문서 사이트가 보인다면 성공입니다! 🎉

참고:
- `npm run dev`는 공식 문서 사이트(`website/`)를 실행합니다.
- `npm run dev:test`는 테스트 프로젝트(`tests/luau-module-project/website`)를 실행합니다.

---

## 5단계: 다음 단계

축하합니다! 이제 개발 환경이 완벽하게 갖춰졌습니다.
다음 문서를 읽으며 Bakerywave의 구조를 파악해 보세요.

👉 **[개발 가이드 (저장소 구조 이해하기)](./index.md)**
