---
title: 기타 컴포넌트
sidebar_label: 기타 컴포넌트
description: Chip, BetaAlert, UseStudioButton 컴포넌트 사용법을 설명합니다.
---

# 기타 컴포넌트

## 지원 컴포넌트

- `<Chip>`
- `<BetaAlert>`
- `<UseStudioButton>`

## `<Chip>`

상태 태그나 라벨을 짧게 표시할 때 사용합니다.

주요 속성:

- `label` (또는 `children`)
- `size`: `small` | `medium` (기본값 `medium`)
- `variant`: `outlined` | `filled` (기본값 `filled`)
- `color` (기본값 `default`)
- `className`, `style`

예시:

```mdx
<Chip label="Stable" />
<Chip label="Beta" color="warning" />
<Chip variant="outlined" size="small">Custom</Chip>
```

## `<BetaAlert>`

베타 기능 안내 메시지를 출력합니다.

주요 속성:

- `betaName` (기본값 `This feature`)
- `leadIn` (기본값 `This feature is currently in beta. Enable it through `)
- `leadOut` (기본값 `.`)
- `className`

예시:

```mdx
<BetaAlert betaName="Asset Pipeline" />
<BetaAlert
  betaName="Studio Sync"
  leadIn="Studio에서 먼저 베타를 켜세요: "
  leadOut=" 설정 후 다시 시도하세요."
/>
```

## `<UseStudioButton>`

Roblox Studio 관련 링크 버튼을 렌더링합니다.

주요 속성:

- `buttonTextTranslationKey` (`Action.EditInStudio` 지원)
- `buttonText`
- `placeId`
- `universeId`
- `variant`
- `className`

동작 우선순위:

- 라벨: `buttonText` -> `buttonTextTranslationKey` -> 기본값(`Open in Studio`)
- 링크: `universeId` -> `placeId` -> `#`

예시:

```mdx
<UseStudioButton buttonTextTranslationKey="Action.EditInStudio" universeId="123456789" />
<UseStudioButton buttonText="Open Place" placeId="987654321" variant="outlined" />
```
