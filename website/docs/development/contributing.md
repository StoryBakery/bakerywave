---
title: 기여하기
sidebar_label: 기여
sidebar_position: 2
---

# 기여하기 (Contributing)

Bakerywave 프로젝트에 관심을 가져주셔서 감사합니다! 👋
이 문서는 여러분이 프로젝트에 쉽게 기여할 수 있도록 돕기 위해 작성되었습니다.

오타 수정부터 새로운 기능 추가까지, 모든 기여를 환영합니다.

## 1. 기여 절차 (Workflow)

오픈소스 프로젝트는 보통 **Fork & Pull Request(PR)** 방식을 사용합니다.
이 용어가 낯선 분들을 위해 단계별로 설명해 드릴게요.

### 1단계: 이슈 확인 및 논의
작업을 시작하기 전에 [Issues](https://github.com/storybakery/bakerywave/issues)에서 관련된 내용이 있는지 확인하세요.
- **이슈(Issue)**: 버그 신고나 새로운 아이디어를 제안하는 게시글입니다.
- 내가 하고 싶은 작업이 이미 있다면 코멘트를 남겨주세요. 없다면 새로 작성해서 논의하는 것이 좋습니다.

### 2단계: 저장소 Fork 및 Clone
내 계정으로 프로젝트를 복사해오는 작업입니다.

1. GitHub 페이지 우측 상단의 **Fork** 버튼을 누르세요. (내 계정으로 저장소가 복사됩니다)
2. 내 계정에 생긴 저장소를 컴퓨터로 다운로드(**Clone**)합니다.

```bash
git clone https://github.com/<your-username>/bakerywave.git
cd bakerywave
```

### 3단계: 브랜치(Branch) 생성
원본을 안전하게 보호하기 위해, 작업 전용 통로(브랜치)를 만듭니다.
`main` 브랜치는 항상 깨끗한 상태로 유지하는 것이 좋습니다.

```bash
# feature/my-awesome-feature 라는 이름의 브랜치를 만들고 이동합니다.
git checkout -b feature/my-awesome-feature
```

### 4단계: 개발 환경 설정
[개발 환경 구축 (처음부터)](./getting-started.md) 문서를 참고하여 도구를 설치하고 실행 준비를 마칩니다.

### 4.1 개발 표준 (로컬 연동)
개발 중에는 `@storybakery/*` 패키지를 **`file:` 의존성으로 연결한 상태**를 표준으로 사용합니다.
이 방식은 npm 표준 기능이며, Git 태그/배포 없이 로컬 수정을 즉시 검증할 수 있습니다.

### 5단계: 코드 수정 및 테스트
코드를 수정한 뒤에는 반드시 테스트 사이트에서 정상 작동하는지 확인해야 합니다.

```bash
# 변경 사항 반영 및 테스트 사이트 실행
npm run reference:build
npm run dev:test
```

자세한 테스트 방법은 [테스트 가이드](./tests/index.md)를 참고하세요.

### 6단계: 커밋(Commit) 및 푸시(Push)
작업 내용을 저장(Commit)하고 내 GitHub 저장소로 업로드(Push)합니다.

```bash
git add .
git commit -m "feat: 다크 모드 토글 기능 추가"
git push origin feature/my-awesome-feature
```

### 7단계: Pull Request(PR) 생성
이제 내 작업물을 원본 저장소(`storybakery/bakerywave`)에 합쳐달라고 요청할 차례입니다.

1. GitHub 저장소 페이지로 이동하면 **Compare & pull request** 버튼이 보일 것입니다.
2. 템플릿에 맞춰 변경 사항을 상세히 작성해 주세요.
3. 관리자가 내용을 확인하고(Review), 문제가 없으면 합쳐줍니다(Merge).

---

## 2. 커밋 메시지 규칙

우리는 일관된 이력을 남기기 위해 다음과 같은 말머리(Prefix)를 사용합니다.

| 태그       | 설명                                      | 예시                              |
| :--------- | :---------------------------------------- | :-------------------------------- |
| `feat`     | 새로운 기능 추가                          | `feat: Add dark mode toggle`      |
| `fix`      | 버그 수정                                 | `fix: Fix login page crash`       |
| `docs`     | 문서 수정                                 | `docs: Update contributing guide` |
| `style`    | 코드 포맷팅, 세미콜론 등 (코드 변경 없음) | `style: Fix indentation`          |
| `refactor` | 코드 구조 개선 (기능 변경 없음)           | `refactor: Optimize logic`        |
| `test`     | 테스트 코드 추가/수정                     | `test: Add button tests`          |
| `chore`    | 빌드 설정, 의존성 업데이트 등 기타 작업   | `chore: Update node modules`      |

---

## 3. PR 전 체크리스트

PR을 올리기 전에 다음 사항을 확인해 주세요.

- [ ] [개발 환경 구축](./getting-started.md)의 모든 단계를 통과했나요?
- [ ] [테스트 시나리오](./tests/scenarios.md)의 관련 항목을 확인했나요?
- [ ] 문서 수정 시 오타는 없나요?
- [ ] 새로운 기능을 추가했다면, 관련 문서도 업데이트했나요?

---

## 4. 질문이 있다면?

개발 중 막히는 부분이 있거나 궁금한 점이 있다면 언제든 [Discussions](https://github.com/storybakery/bakerywave/discussions)이나 이슈를 통해 질문해 주세요.
여러분의 기여를 기다립니다! 🚀
