---
title: 2. i18n 초기 설정
---

# 2. i18n 초기 설정

이 문서는 Bakerywave 기준 i18n 초기 설정을 실제 파일 단위로 설명합니다.

## 1) `bakerywave.toml` 설정

프로젝트 루트 `bakerywave.toml`에 i18n 항목을 추가합니다.

```toml
schemaVersion = 1

[i18n]
defaultLocale = "en"
locales = ["en", "ko"]
referenceLocales = ["ko"]

[i18n.reference]
copy = true

[site.locale]
enabled = true

[site.locale.labels]
en = "English"
ko = "한국어"

[site.navbar]
showLocaleDropdown = true
```

핵심 항목:

- `defaultLocale`: 원문 기준 언어
- `locales`: 사이트 지원 언어
- `referenceLocales`: Reference 자동 복제 대상 locale
- `i18n.reference.copy`: Reference 복제 on/off

## 2) `docusaurus.config.js`와 값 동기화

`docusaurus.config.js`의 `i18n`과 preset 옵션에도 같은 값을 선언합니다.

```js
module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ko"],
  },
  presets: [
    [
      "@storybakery/docs-preset",
      {
        i18n: {
          defaultLocale: "en",
          locales: ["en", "ko"],
        },
      },
    ],
  ],
};
```

주의:

- 값이 다르면 빌드 시 i18n 정책 검증 에러가 발생할 수 있습니다.

## 3) 초기 번역 리소스 생성

```bash
bakerywave write-translations -- --locale ko
```

여러 언어를 운영하면 locale마다 반복 실행합니다.

## 4) 실행 확인

```bash
npm run dev
```

확인 포인트:

- 기본 locale 페이지 노출
- locale 경로(예: `/ko/`) 접근 가능
- Navbar 언어 드롭다운 노출

다음 단계: [3. 일반 문서 번역 워크플로](./document-workflow.md)
