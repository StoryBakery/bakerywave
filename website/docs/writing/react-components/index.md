---
title: 지원 React 컴포넌트
sidebar_label: React Components
description: Bakerywave 문서에서 바로 사용할 수 있는 React 컴포넌트의 전체 구조를 안내합니다.
---

# 지원 React 컴포넌트

이 문서는 React 컴포넌트 문서의 **개요 페이지**입니다.
세부 속성과 예시는 사이드바의 하위 문서에서 계열별로 확인할 수 있습니다.

기준 구현 파일:
`packages/docs-theme/theme/MDXComponents.js`

## 사용 규칙

- `.md`/`.mdx` 문서에서 동일하게 사용할 수 있습니다.
- 대부분의 컴포넌트는 전역 등록되어 `import` 없이 바로 사용할 수 있습니다.
- 아래 문서는 현재 구현 기준이며, 코드 변경 시 함께 갱신됩니다.

## 문서 구성

1. [Alert 계열](./alerts.md)
2. [Accordion / Tabs 계열](./accordion-tabs.md)
3. [Layout / Text 계열](./layout-text.md)
4. [Button / Card 계열](./button-card.md)
5. [기타 컴포넌트](./misc.md)
6. [Reference UI 계열](./reference-ui.md)

## 기본 MDX 요소 매핑

아래 기본 요소도 MDX에서 사용할 수 있습니다.

- `details` / `Details`
- `code`, `a`, `pre`, `ul`, `li`, `img`
- `h1`~`h6`
- `mermaid`
