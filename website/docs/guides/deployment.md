---
title: 배포하기
sidebar_position: 4
---

# 배포하기

문서 작성이 끝났다면 전 세계 사람들에게 공개해야겠죠?

## 1. 정적 파일 생성 (Build)

먼저 배포 가능한 형태(HTML, CSS, JS)로 변환해야 합니다.

```bash
npm run build
```
또는
```bash
bakerywave build
```

이 명령어를 실행하면 `build/` 폴더가 새로 생깁니다. 이 폴더 안의 내용물이 바로 **실제 웹사이트 파일들**입니다.

## 2. 호스팅 서비스에 올리기

`build/` 폴더 안의 내용물을 정적 웹사이트 호스팅 서비스에 업로드하면 배포가 완료됩니다.

대표적인 무료 호스팅 서비스:
*   **GitHub Pages**: 설정이 쉽고 무료입니다. (추천)
*   **Vercel**: 빠르고 사용하기 편리합니다.
*   **Netlify**: 다양한 기능을 제공합니다.

### GitHub Pages 배포 예시

만약 GitHub 저장소를 사용 중이라면, `bakerywave.toml` 설정만으로는 부족하고 추가 설정이 필요할 수 있습니다.
가장 쉬운 방법은 GitHub Actions를 사용하는 것입니다.

`.github/workflows/deploy.yml` 파일을 만들고 아래 내용을 참고하여 작성하세요. (Docusaurus 공식 가이드 참고 권장)

기본적으로는 **`build/` 폴더를 웹 서버에 올린다**는 원리만 기억하시면 됩니다!
