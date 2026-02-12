---
title: 6. 트러블슈팅
---

# 6. 트러블슈팅

번역 운영 중 자주 발생하는 문제와 점검 방법입니다.

## 1) i18n 정책 불일치 에러

증상:

- `siteConfig.i18n.locales가 정책과 다릅니다.`
- `siteConfig.i18n.defaultLocale가 정책과 다릅니다.`

원인:

- `bakerywave.toml`
- `docusaurus.config.js`의 `i18n`
- `@storybakery/docs-preset`의 `i18n`

세 위치의 값이 서로 다를 때 발생합니다.

해결:

1. 세 위치의 `defaultLocale` 값을 동일하게 맞춥니다.
2. 세 위치의 `locales` 값을 동일하게 맞춥니다.
3. 개발 서버를 재시작합니다.

## 2) Reference locale 복제가 되지 않음

점검 순서:

1. `i18n.reference.copy = true`인지 확인합니다.
2. `referenceLocales` 값이 올바른지 확인합니다.
3. `referenceLocales`를 비운 경우 `locales - defaultLocale` 계산 결과를 확인합니다.
4. `bakerywave reference build --site-dir .`를 다시 실행합니다.

## 3) 언어 드롭다운이 보이지 않음

점검 순서:

1. `locales`가 두 개 이상인지 확인합니다.
2. `[site.locale].enabled = true`인지 확인합니다.
3. `[site.navbar].showLocaleDropdown = true`인지 확인합니다.

## 4) 번역 파일 경로가 적용되지 않음

원인:

- 번역 파일 경로가 `i18n/<locale>/docusaurus-plugin-content-docs/current/...` 형식을 따르지 않음

해결:

1. 원문 경로를 기준으로 번역 경로를 다시 맞춥니다.
2. 파일명과 상대 경로가 동일한지 확인합니다.
3. 개발 서버에서 해당 locale 페이지를 다시 확인합니다.
