---
title: 1. 시작하기
---

# 1. 시작하기

이 문서는 Bakerywave 문서 사이트에서 i18n 번역 작업을 시작하기 전에 준비해야 할 항목을 정리합니다.

## 준비 항목

- 문서 사이트 프로젝트(`bakerywave init`으로 생성한 구조 또는 동일 구조의 기존 프로젝트)
- Node.js 및 npm
- 프로젝트 루트의 `bakerywave.toml`
- 사이트 설정 파일(`docusaurus.config.js`)

## 시작 전 결정할 정책

처음에 아래 세 값을 팀 기준으로 고정해두면 이후 운영이 안정적입니다.

1. 기본 언어(`defaultLocale`)
2. 지원 언어 목록(`locales`)
3. Reference 복제 대상(`referenceLocales`)

예:

- 기본 언어: `en`
- 지원 언어: `["en", "ko"]`
- Reference 복제 대상: `["ko"]`

## 최소 확인 절차

아직 사이트가 없다면:

```bash
bakerywave init my-docs
cd my-docs
npm install
```

이미 사이트가 있다면 프로젝트 루트에서:

```bash
npm install
npm run dev
```

확인 포인트:

- 개발 서버가 정상 기동된다.
- 기본 문서 라우트가 열린다.

다음 단계: [2. i18n 초기 설정](./initial-setup.md)
