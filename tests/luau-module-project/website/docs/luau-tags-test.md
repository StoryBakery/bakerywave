---
title: Luau 태그 테스트
sidebar_label: Luau 태그
---

# Luau 태그 테스트

이 페이지는 Luau 주석 태그가 reference로 제대로 반영되는지 확인하기 위한 안내입니다.

## 포함된 태그 예시

- @class
- @within / @withinDefault
- @param / @return / @error / @yields
- @category / @group
- @since / @deprecated / @unreleased
- @server / @client / @plugin
- @private / @ignore
- @readonly
- `@event <Name>` + `@param`
- @extends
- @__index
- @external

참고 문서: `Classes.DocFeatureClass`, `Classes.BaseFeature`

## @param 멀티라인 + @default

```lua
--[=[
    @param recursive boolean -- [[
        재귀적으로 탐색합니다.
        여러 줄 설명이 가능합니다.
        @default false
    ]]
]=]
function find(recursive: boolean)
end
```

## @class 생략 규칙 확인
- 파일 첫 문서 주석이 `--[=[ ... ]=]` 단독 설명일 때 자동으로 클래스가 생성되는지 확인
- `FileClassImplicit.luau`가 `FileClassImplicit` 클래스로 생성되는지 확인
- `AutoInitClass/init.luau`가 `AutoInitClass` 클래스로 생성되는지 확인 (`init.*`는 상위 디렉토리명 사용)

참고 문서: `Classes.FileClassImplicit`, `Classes.AutoInitClass`

## @event 확인
- `Events` 그룹에 이벤트가 표시되는지 확인
- `@event <Name>`의 이름이 제목에 반영되는지 확인
- `@param` 목록과 멀티라인 설명이 렌더링되는지 확인
- `@default`와 `@since`가 이벤트에도 표시되는지 확인

참고 문서: `Classes.DocFeatureClass`, `Classes.DocWidget`, `Classes.InteractiveObject`

## docgen 스크립트 타입 확인
- `Showcase/Advanced`에 `DocgenTypes` 클래스가 생성되는지 확인
- `Types` 섹션에 공백/괄호가 포함된 이름이 표시되는지 확인
- `DocgenMembers` 클래스에 `Properties/Methods/Events/Interfaces/Types`가 모두 표시되는지 확인
- `Core`, `Events`, `Meta`, `기타` 그룹으로 멤버가 분류되는지 확인
- `Resolve` 메서드에서 `Parameters/Returns/Errors` 섹션이 표시되는지 확인
- `Resolved` 이벤트에서 `Parameters` 섹션이 표시되는지 확인
- `DocgenMultiLine` 클래스에서 멀티라인 설명/정적 메서드(`CreateFromRaw`)가 정상 반영되는지 확인
- `DocgenMultiLine`의 `groups["기타"]`, `groups["세부"]` 멤버가 그룹 섹션으로 표시되는지 확인
- `DocgenCrossWithin`에서 `within`으로 `DocgenMembers`에 주입한 심볼이 나타나는지 확인
- `DocgenCrossWithin`에서 `within`으로 `AdvancedTypes`에 주입한 타입/메서드가 나타나는지 확인

참고 문서: `Classes.DocgenTypes`, `Classes.DocgenMembers`, `Classes.DocgenMultiLine`, `Classes.DocgenCrossWithin`

## 카테고리/그룹 확인
- 카테고리: `Docs/Categories` 계층이 Overview에 표시되는지 확인
- 그룹: `Setup`, `Query`, `Basics` 섹션이 클래스 페이지에 표시되는지 확인

참고 문서: `Classes.CategoryAlpha`, `Classes.CategoryBeta`, `Classes.CategoryRoot`

## 조합 관계/링크 확인
- 조합 관계: `Classes.DocWidget`이 `Classes.DocWidgetConfig`, `Classes.DocWidgetState`를 포함하는지 확인
- 링크: `Class.TextLabel`, `Class.GuiButton.Activated`, `Library.coroutine.create()`가 Roblox 문서로 링크되는지 확인

참고 문서: `Classes.DocWidget`, `Classes.DocWidgetConfig`, `Classes.DocWidgetState`
