---
title: 배포하기
sidebar_position: 4
---

# 배포하기

문서 작성이 끝났다면 전 세계 사람들에게 공개할 차례입니다.
Bakerywave로 만든 문서는 정적 웹사이트(Static Website)로 빌드되므로, GitHub Pages, Vercel, Netlify 등 다양한 무료 호스팅 서비스에 쉽게 배포할 수 있습니다.

## 배포 과정 요약

1. **빌드(Build)**: `bakerywave build` 명령어로 배포 가능한 정적 파일들을 생성합니다.
2. **배포(Deploy)**: 생성된 파일들을 웹 호스팅 서비스에 업로드합니다.

보통은 이 과정을 **CI/CD 파이프라인(GitHub Actions 등)** 을 통해 자동화하여,
GitHub에 커밋을 푸시할 때마다 자동으로 사이트가 업데이트되도록 설정합니다.

## 로컬에서 빌드하기

배포 설정을 하기 전에, 내 컴퓨터에서 빌드가 잘 되는지 먼저 확인해보세요.

```bash
npm run build
```

또는

```bash
bakerywave build
```

이 명령어를 실행하면 `build/` 폴더가 새로 생깁니다. 이 폴더 안의 내용물이 바로 **실제 웹사이트 파일들**입니다.
이 폴더를 그대로 웹 서버에 올리면 사이트가 동작합니다.

## 배포 방법 선택

가장 많이 사용되는 세 가지 방법을 안내합니다.

- [GitHub Pages 배포하기](./github-pages.md) (추천)
- [Vercel 배포하기](./vercel.md)
- [Netlify 배포하기](./netlify.md)
