---
title: Reference UI 계열
sidebar_label: Reference UI
description: Reference 스타일(`sb-ref-*`)을 MDX에서 재사용하는 방법을 설명합니다.
---

# Reference UI 계열

Reference 생성기에서 사용하는 UI 클래스를 문서에서도 재사용할 수 있습니다.

## 핵심 컴포넌트

- `<ReferenceList>` / `<RefList>`: 목록 컨테이너 (`sb-ref-list`)
- `<ReferenceRow>` / `<RefRow>`: 항목 행 (`sb-ref-row`)
  - `deprecated`가 `true`/`"true"`면 `sb-ref-row-deprecated`가 적용됩니다.
- `<ReferenceCellIcon>` / `<RefCellIcon>`: 아이콘 셀 (`sb-ref-cell-icon`)
  - `kind`: `property` | `method` | `function` | `event`
- `<ReferenceCellContent>` / `<RefCellContent>`: 텍스트 셀 (`sb-ref-cell-content`)
- `<ReferenceName>` / `<RefName>`: 멤버 이름 (`sb-ref-name`)
  - `href`가 있으면 링크(`<a>`)로 렌더링됩니다.
- `<ReferenceType>` / `<RefType>`: 타입 영역 (`sb-ref-type`)
- `<ReferenceSeparator>` / `<RefSeparator>`: 구분자 (`sb-ref-separator`, 기본값 `:`)
- `<ReferenceBadge>` / `<RefBadge>`: 태그 배지 (`sb-ref-badge`)
  - `type`: `deprecated`, `readonly`, `yields`, `server`, `client`, `plugin`, `unreleased`, `since`, `tag`
- `<ReferenceClassBadges>` / `<RefClassBadges>`: 클래스 헤더 배지 래퍼 (`sb-ref-class-badges`)
- `<ReferenceIcon>` / `<RefIcon>`: 아이콘 단독 렌더
- `<ReferenceSourceIcon>` / `<RefSourceIcon>`, `<ReferenceSourceLink>` / `<RefSourceLink>`: 소스 링크 UI
- `<ReferenceHeadingRow>` / `<RefHeadingRow>`, `<ReferenceHeadingText>` / `<RefHeadingText>`: 헤더 라인 UI

## 예시 코드

```mdx
<ReferenceClassBadges>
  <ReferenceBadge type="server">Server</ReferenceBadge>
  <ReferenceBadge type="since">Since 1.2.0</ReferenceBadge>
</ReferenceClassBadges>

<ReferenceList>
  <ReferenceRow>
    <ReferenceCellIcon kind="property" />
    <ReferenceCellContent>
      <ReferenceName href="#enabled">Enabled</ReferenceName>
      <ReferenceSeparator />
      <ReferenceType>boolean</ReferenceType>
      <ReferenceBadge type="readonly">ReadOnly</ReferenceBadge>
    </ReferenceCellContent>
  </ReferenceRow>
  <ReferenceRow deprecated>
    <ReferenceCellIcon kind="method" />
    <ReferenceCellContent>
      <ReferenceName href="#destroy">Destroy</ReferenceName>
      <ReferenceSeparator />
      <ReferenceType>() -&gt; ()</ReferenceType>
      <ReferenceBadge type="deprecated">Deprecated</ReferenceBadge>
    </ReferenceCellContent>
  </ReferenceRow>
</ReferenceList>
```

## 실제 출력

<ReferenceClassBadges>
  <ReferenceBadge type="server">Server</ReferenceBadge>
  <ReferenceBadge type="since">Since 1.2.0</ReferenceBadge>
</ReferenceClassBadges>

<ReferenceList>
  <ReferenceRow>
    <ReferenceCellIcon kind="property" />
    <ReferenceCellContent>
      <ReferenceName href="#enabled">Enabled</ReferenceName>
      <ReferenceSeparator />
      <ReferenceType>boolean</ReferenceType>
      <ReferenceBadge type="readonly">ReadOnly</ReferenceBadge>
    </ReferenceCellContent>
  </ReferenceRow>
  <ReferenceRow deprecated>
    <ReferenceCellIcon kind="method" />
    <ReferenceCellContent>
      <ReferenceName href="#destroy">Destroy</ReferenceName>
      <ReferenceSeparator />
      <ReferenceType>() -&gt; ()</ReferenceType>
      <ReferenceBadge type="deprecated">Deprecated</ReferenceBadge>
    </ReferenceCellContent>
  </ReferenceRow>
</ReferenceList>
