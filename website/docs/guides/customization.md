---
title: 디자인 커스터마이징
sidebar_position: 3
---

# 디자인 커스터마이징

Bakerywave는 Docusaurus를 기반으로 하기 때문에, Docusaurus의 강력한 커스터마이징 기능을 그대로 사용할 수 있습니다.

## 1. 색상 변경 (CSS)

사이트의 주조색(Primary Color)이나 배경색, 폰트 등을 바꾸고 싶다면 `src/css/custom.css` 파일을 수정하세요.

```css
:root {
  /* 라이트 모드 색상 */
  --ifm-color-primary: #ff6600; /* 오렌지색으로 변경 */
  --ifm-color-primary-dark: #e65c00;
  /* ... */
}

[data-theme='dark'] {
  /* 다크 모드 색상 */
  --ifm-color-primary: #ff8833;
}
```

저장하면 즉시 색상이 바뀝니다.

## 2. 로고 및 제목 변경

`docusaurus.config.js` 파일에서 `themeConfig.navbar` 섹션을 찾아 수정하세요.

```js
themeConfig: {
  navbar: {
    title: '내 프로젝트 이름',
    logo: {
      alt: '로고 설명',
      src: 'img/logo.svg', // static/img/logo.svg 경로
    },
    // ...
  },
}
```

## 3. 사이드바 메뉴 구조

왼쪽 사이드바 메뉴는 `sidebars.js` (또는 `.ts`) 파일에서 정의합니다.
문서의 순서를 바꾸거나, 카테고리 이름을 변경하고, 외부 링크를 추가할 수 있습니다.

```js
module.exports = {
  mySidebar: [
    {
      type: 'category',
      label: '시작하기',
      items: ['intro', 'installation'],
    },
    // ...
  ],
};
```

더 자세한 내용은 [Docusaurus 공식 문서](https://docusaurus.io/docs/sidebar)를 참고하세요.
