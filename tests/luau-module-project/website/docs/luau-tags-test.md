---
title: Luau Tag Test
sidebar_label: Luau Tags
---

# Luau Tag Test

This page is a checklist for validating that Luau doc comment tags are correctly reflected in generated reference docs.

## Included Tag Examples

- @class
- @within
- @file / @option
- @type / @variant
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

Reference docs: `Docs.Features.DocFeatureClass`, `Docs.Features.BaseFeature`

## @param Multiline + @default

```lua
--[=[
    @param recursive boolean
        Recursively scans child nodes.
        Multi-line descriptions are supported.
        @default false
]=]
function find(recursive: boolean)
end
```

## @class Inference Rule Checks
- Verify that a class is auto-created when the first doc comment in a file is a standalone `--[=[ ... ]=]` block.
- Verify that `FileClassImplicit.luau` is generated as the `FileClassImplicit` class.
- Verify that `AutoInitClass/init.luau` is generated as the `AutoInitClass` class (`init.*` uses parent directory name).
- Verify that `Showcase.luau` applies `@file` + `@option within.default` as the default container.

Reference docs: `Classes.FileClassImplicit`, `Classes.AutoInitClass`

## @event Checks
- Verify that events are rendered under the `Events` group.
- Verify that the `@event <Name>` value appears in the heading.
- Verify that `@param` lists and multiline descriptions are rendered.
- Verify that `@default` and `@since` also appear for events.

Reference docs: `Docs.Features.DocFeatureClass`, `Docs.Relations.DocWidget`, [InteractiveObject](/reference/luau/Showcase/Core/InteractiveObject)

## Docgen Script Type Checks
- Verify `DocgenTypes` is generated under `Showcase/Advanced`.
- Verify type names that include spaces/parentheses are rendered in the `Types` section.
- Verify `DocgenMembers` includes all sections: `Properties/Methods/Events/Interfaces/Types`.
- Verify members are grouped into `Core`, `Events`, `Meta`, and `기타`.
- Verify the `Resolve` method renders `Parameters/Returns/Errors` sections.
- Verify the `Resolved` event renders the `Parameters` section.
- Verify `TypedMap` shows `Type Parameters` with default value (`T = number`).
- Verify `DocgenMultiLine` keeps multiline descriptions and static method (`CreateFromRaw`) output.
- Verify `DocgenMultiLine` members in `groups["기타"]` and `groups["세부"]` appear in grouped sections.
- Verify symbols injected with `within` from `DocgenCrossWithin` appear in `DocgenMembers`.
- Verify types/methods injected with `within` from `DocgenCrossWithin` appear in `AdvancedTypes`.

Reference docs: [DocgenTypes](/reference/luau/Showcase/Advanced/DocgenTypes), [DocgenMembers](/reference/luau/Showcase/Advanced/DocgenMembers), [DocgenMultiLine](/reference/luau/Showcase/Advanced/DocgenMultiLine), [DocgenCrossWithin](/reference/luau/Showcase/Advanced/DocgenCrossWithin)

## Category/Group Checks
- Category: verify that `Docs/Categories` hierarchy appears in the overview page.
- Group: verify that `Setup`, `Query`, `Basics` sections appear on the class page.

Reference docs: [CategoryTest](/reference/luau/Tests/Deep/Nested/Category/CategoryTest), [MultiCategory](/reference/luau/Tests/A/MultiCategory)

## Composition/Link Checks
- Composition: verify that `Docs.Relations.DocWidget` includes `Docs.Relations.DocWidgetConfig` and `Docs.Relations.DocWidgetState`.
- Links: verify that `Class.TextLabel`, `Class.GuiButton.Activated`, and `Library.coroutine.create()` resolve to Roblox docs.

Reference docs: `Docs.Relations.DocWidget`, `Docs.Relations.DocWidgetConfig`, `Docs.Relations.DocWidgetState`
