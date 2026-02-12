---
title: 3. 일반 문서 번역 워크플로
---

# 3. 일반 문서 번역 워크플로

이 문서는 manual 문서(`docs/` 아래 문서)의 번역 절차를 설명합니다.

## 디렉터리 규칙

- 원문: `docs/...`
- 번역: `i18n/<locale>/docusaurus-plugin-content-docs/current/...`

예:

```text
원문: docs/guides/deployment.md
번역: i18n/ko/docusaurus-plugin-content-docs/current/guides/deployment.md
```

## 작업 순서

1. 원문 문서를 먼저 수정합니다.
2. 번역 파일을 같은 상대 경로에 생성 또는 수정합니다.
3. 제목/본문/경고 블록을 번역합니다.
4. 코드 블록, 명령어, 파일 경로, 옵션명은 원문 표기를 유지합니다.
5. 문서 내부 링크는 동일 상대 경로를 유지합니다.

## 권장 운영 방식

- 원문 변경과 번역 변경을 같은 PR에 포함해도 됩니다.
- 경로는 섞지 않습니다.
  - 원문 변경: `docs/`
  - 번역 변경: `i18n/<locale>/.../current/`

## PR 전 점검

- 번역 문서 경로가 원문과 1:1 대응되는지 확인합니다.
- 링크가 깨지지 않는지 locale 페이지에서 확인합니다.
- 원문에서 변경된 옵션명/코드가 번역본에서도 동일한지 확인합니다.

다음 단계: [4. Reference 번역(복제) 워크플로](./reference-workflow.md)
