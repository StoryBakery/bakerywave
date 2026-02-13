---
title: Vercel 배포하기
---

# Vercel 배포하기

Vercel은 정적 사이트 및 서버리스 함수 배포를 위한 클라우드 플랫폼으로, 설정이 매우 간편하고 성능이 뛰어납니다.

## 1. Vercel 프로젝트 생성

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인합니다.
2. **Add New...** > **Project**를 클릭합니다.
3. GitHub 계정을 연결하고, 문서 사이트가 있는 저장소를 **Import** 합니다.

## 2. 빌드 설정 구성

Vercel이 프로젝트를 분석하여 대부분의 설정을 자동으로 채워주지만, 폴더 구조에 따라 확인이 필요합니다.

- **Framework Preset**: `Other` 또는 `Docusaurus` (자동 감지됨)
- **Root Directory**:
    - 문서 프로젝트가 루트에 있다면 그대로 둡니다.
    - `website` 폴더 안에 있다면 `Edit`을 눌러 `website`를 선택합니다.
- **Build Command**: `npm run build` (또는 `bakerywave build`)
- **Output Directory**: `build`
- **Install Command**: `npm install` (또는 `npm ci`)

## 3. 배포 실행

**Deploy** 버튼을 누르면 Vercel이 자동으로 코드를 받아 빌드를 시작합니다.
빌드가 완료되면 미리보기 URL과 프로덕션 URL이 제공됩니다.

## 4. 자동 배포

이제 GitHub의 `main` 브랜치에 코드를 푸시할 때마다 Vercel이 자동으로 변경사항을 감지하여 재배포합니다.
PR(Pull Request)이 생성되면 미리보기(Preview) 배포도 자동으로 생성되어, 병합 전에 변경된 문서를 미리 확인할 수 있습니다.
