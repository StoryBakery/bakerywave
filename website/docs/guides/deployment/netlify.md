---
title: Netlify 배포하기
---

# Netlify 배포하기

Netlify 역시 정적 웹사이트 호스팅으로 매우 유명하며, 간단한 설정으로 배포가 가능합니다.

## 1. Netlify 사이트 생성

1. [Netlify](https://app.netlify.com/)에 로그인합니다.
2. **Add new site** > **Import an existing project**를 클릭합니다.
3. **GitHub**를 선택하고 저장소를 연결합니다.

## 2. 빌드 설정 구성

저장소를 선택하면 빌드 설정 화면이 나옵니다.

- **Base directory**:
    - 문서 프로젝트가 루트에 있다면 비워둡니다.
    - `website` 폴더 안에 있다면 `website`라고 입력합니다.
- **Build command**: `npm run build`
- **Publish directory**: `build`

## 3. 배포 실행

**Deploy site** 버튼을 클릭합니다.
Netlify가 빌드를 시작하고, 완료되면 랜덤하게 생성된 URL(예: `brave-curie-123456.netlify.app`)로 사이트에 접속할 수 있습니다.

## 4. 도메인 설정 (선택 사항)

**Site settings > Domain management**에서 사이트 주소를 변경하거나, 구매한 커스텀 도메인을 연결할 수 있습니다.
