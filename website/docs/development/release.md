---
title: 릴리즈 가이드
sidebar_label: 릴리즈
sidebar_position: 4
---

# 릴리즈 가이드 (Release Guide)

이 문서는 Bakerywave의 새 버전을 배포하고 릴리즈하는 절차를 설명합니다.
릴리즈 권한이 있는 메인테이너(Maintainer)를 위한 문서입니다.

---

## 1. 버전 관리 규칙 (Versioning)

Bakerywave는 **Semantic Versioning (SemVer)** 규칙을 따릅니다.
버전 형식: `vX.Y.Z` (예: `v1.2.0`)

- **Major (X)**: 하위 호환성이 깨지는 큰 변경 사항
- **Minor (Y)**: 하위 호환성을 유지하면서 새로운 기능 추가
- **Patch (Z)**: 하위 호환성을 유지하면서 버그 수정

---

## 2. 릴리즈 절차 (Release Process)

우리는 **GitHub Tags**와 **GitHub Actions**를 사용하여 릴리즈를 자동화합니다.
로컬에서 빌드하여 올리지 않고, 태그만 푸시하면 CI 서버가 빌드와 배포를 수행합니다.

### 단계 1: 준비
`main` 브랜치가 최신 상태인지 확인하고, 모든 테스트가 통과되었는지 점검합니다.

### 단계 2: 태그 생성 및 푸시
새 버전을 `v0.1.0`이라고 가정할 때, 다음과 같이 태그를 생성하고 푸시합니다.

```bash
# 로컬 태그 생성
git tag v0.1.0

# 원격 저장소로 태그 푸시
git push origin v0.1.0
```

### 단계 3: CI 파이프라인 모니터링
태그가 푸시되면 **GitHub Actions**의 `release` 워크플로우가 자동으로 시작됩니다.
[Actions 탭](https://github.com/storybakery/bakerywave/actions)에서 진행 상황을 볼 수 있습니다.

CI는 다음 작업을 수행합니다:
1. **Build**: 각 운영체제(Windows, Linux, macOS)용 바이너리 빌드
2. **Test**: 전체 테스트 슈트 실행
3. **Artifacts**: 실행 파일(`bakerywave`, `luau-docgen`) 및 압축 파일 생성
4. **Draft Release**: GitHub Releases 페이지에 초안(Draft) 생성

### 단계 4: 릴리즈 노트 작성 및 배포
1. GitHub 리포지토리의 **Releases** 페이지로 이동합니다.
2. CI가 생성한 Draft Release를 엽니다.
3. **Release notes**에 이번 버전에 변경된 주요 사항을 작성합니다.
   - ✨ New Features
   - 🐛 Bug Fixes
   - 📝 Documentation
4. `Publish release` 버튼을 눌러 정식으로 배포합니다.

---

## 3. 생성되는 결과물 (Artifacts)

릴리즈가 완료되면 사용자는 다음 파일을 다운로드할 수 있게 됩니다.

- **bakerywave-windows-x64.zip**: Windows용 실행 파일
- **bakerywave-linux-x64.zip**: Linux용 실행 파일
- **bakerywave-macos-x64.zip**: macOS용 실행 파일
- **Source code**: 해당 버전의 소스 코드 스냅샷

---

## 4. npm 패키지 배포

태그 릴리즈 시 `NPM_TOKEN`이 설정되어 있으면 npm 패키지도 함께 배포됩니다.

- 배포 대상:
  - `@storybakery/luau-docgen`
  - `@storybakery/docusaurus-plugin-reference`
  - `@storybakery/docusaurus-plugin-search-index`
  - `@storybakery/docs-theme`
  - `@storybakery/docs-preset`
  - `@storybakery/create-docs`
  - `@storybakery/bakerywave`
- 조건:
  - GitHub Actions Secrets에 `NPM_TOKEN`이 설정되어 있어야 합니다.
  - 각 패키지 버전(`package.json`)이 새 버전이어야 합니다.
