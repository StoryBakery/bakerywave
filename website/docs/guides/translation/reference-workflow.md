---
title: 4. Reference 번역(복제) 워크플로
---

# 4. Reference 번역(복제) 워크플로

Bakerywave의 Reference 문서는 수동 번역보다 자동 복제를 기준으로 운영합니다.

## 기본 동작

`bakerywave reference build` 실행 시:

1. `docs/reference/<lang>/`를 생성 또는 갱신합니다.
2. `i18n.reference.copy = true`면 locale별 Reference 경로로 복제합니다.
3. 복제 대상 경로의 기존 내용은 정리 후 다시 복제합니다.

## 설정 항목

```toml
[i18n]
defaultLocale = "en"
locales = ["en", "ko"]
referenceLocales = ["ko"]

[i18n.reference]
copy = true
```

- `referenceLocales`가 있으면 해당 locale만 복제합니다.
- `referenceLocales`가 비어 있으면 `locales - defaultLocale`이 복제 대상입니다.

## 실행 명령

```bash
bakerywave reference build --site-dir .
```

복제 대상 경로:

`i18n/<locale>/docusaurus-plugin-content-docs/current/reference/<lang>`

## 운영 주의사항

- locale Reference 복제본은 수동 편집 대상이 아닙니다.
- 수동 수정 내용은 다음 `reference build`에서 덮어써질 수 있습니다.
- Reference 번역 정책을 바꾸려면 `bakerywave.toml`의 i18n 항목을 먼저 수정합니다.

관련 상세: [생성 / 정리 / 빌드](../../reference/pipeline.md)
