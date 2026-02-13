---
title: GitHub Pages 배포하기
---

# GitHub Pages 배포하기

GitHub Pages는 GitHub 저장소의 정적 파일들을 무료로 호스팅해주는 서비스입니다.
GitHub Actions를 사용하면 소스 코드를 푸시할 때마다 자동으로 문서를 빌드하고 배포할 수 있습니다.

이 가이드에서는 **GitHub Actions**를 사용하여 배포하는 방법을 다룹니다.

## 1. GitHub Actions 권한 설정

저장소 설정에서 Actions가 `GITHUB_TOKEN`으로 쓰기 권한을 가질 수 있도록 허용해야 합니다.

1. GitHub 저장소의 **Settings** 탭으로 이동합니다.
2. 왼쪽 사이드바에서 **Actions > General**을 클릭합니다.
3. **Workflow permissions** 섹션까지 스크롤합니다.
4. **Read and write permissions**를 선택하고 저장합니다.

## 2. 배포 워크플로우 만들기

프로젝트 루트에 `.github/workflows/pages.yml` 파일을 만들고 아래 내용을 복사하세요.
(이미 `bakerywave init`으로 프로젝트를 만들었다면 파일이 포함되어 있을 수 있습니다.)

```yaml
name: Deploy Pages

on:
  push:
    branches:
      - main  # 배포 기준 브랜치 (main 또는 master)
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: |
            package-lock.json
            website/package-lock.json

      # 모노레포 구조인 경우 루트 의존성 설치 (필요 없다면 제거 가능)
      - name: Install workspace dependencies
        run: npm ci

      # 웹사이트 의존성 설치
      - name: Install website dependencies
        run: npm --prefix website ci

      - name: Configure Pages
        uses: actions/configure-pages@v5
        with:
          enablement: true

      # 웹사이트 빌드
      - name: Build website
        run: npm --prefix website run build

      # 빌드 결과물 업로드
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: website/build

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

      - name: Write deployment URL
        run: |
          echo "### GitHub Pages 배포 완료" >> "$GITHUB_STEP_SUMMARY"
          echo "" >> "$GITHUB_STEP_SUMMARY"
          echo "- URL: ${{ steps.deployment.outputs.page_url }}" >> "$GITHUB_STEP_SUMMARY"
```

### 주의사항

- `npm --prefix website run build`: 이 부분은 `website` 폴더 안에 문서 프로젝트가 있을 때의 경로입니다. 만약 프로젝트 루트가 문서 프로젝트라면 `--prefix website`를 제거하세요.
- `branches: - main`: 배포를 트리거할 브랜치 이름이 `master`라면 이 부분을 수정해야 합니다.

## 3. 배포 확인

1. 파일을 커밋하고 GitHub에 푸시합니다.
2. 저장소의 **Actions** 탭으로 이동하여 `Deploy Pages` 워크플로우가 실행되는지 확인합니다.
3. 실행이 성공(초록색 체크)하면, 워크플로우 로그의 `deploy` 단계에서 배포된 URL을 확인할 수 있습니다.
4. 해당 URL로 접속하여 사이트가 잘 나오는지 확인합니다.

---

## (참고) 다른 방법: gh-pages 패키지 사용

GitHub Actions를 사용하지 않고, 로컬에서 빌드하여 `gh-pages` 브랜치로 직접 푸시하는 고전적인 방법도 있습니다.
하지만 Docusaurus 및 최신 GitHub Pages에서는 **GitHub Actions** 방식을 더 권장합니다.
Actions 방식이 빌드 환경을 일관되게 유지해주고, 빌드 결과물을 저장소 커밋 내역에 남기지 않아 저장소 크기 관리에도 유리하기 때문입니다.
