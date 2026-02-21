# Docgen Feature Showcase

This page provides a compact overview of the major signatures and tags supported by the `bakerywave` doc generator (Docgen).
You can inspect real output under `Reference` in the `Showcase` classes.

## 1. Inheritance and Hierarchy
- **Deep inheritance chains**: supports multi-level inheritance such as `BaseObject` -> `InteractiveObject` -> `ComplexComponent`.
- **Inherited member rendering**: inherited properties/methods are shown in Roblox-style sections.
- **Inherited By links**: parent class pages include links to derived classes.

## 2. Tags and Badges
Common metadata tags are visualized as badges:
- `@readonly`: marks read-only members.
- `@deprecated`: shows deprecation warnings.
- `@server` / `@client` / `@plugin`: shows runtime constraints.
- `@yields`: indicates yielding/asynchronous behavior.
- `@unreleased`: marks experimental, unreleased features.

## 3. Summary and Grouping
- **Summary section**: shows member overview tables with icons near the top of each class page.
- **@group**: organizes related members into named sections (e.g. Configuration, Lifecycle, Events).

## 4. Type System
- **Automatic linkifying**: class/interface names in parameter and return types are linked automatically.
- **Complex type rendering**: supports generics (`NestedGeneric<T, U>`), function types, and nested table types.

## 5. Categories
- **Deep nesting**: supports multi-level category paths like `Tests/Deep/Nested/Category`.
- **Multi-category support**: one class can belong to multiple categories.

---

Start exploring from [Reference -> Showcase/Core -> BaseObject](/reference/luau/Showcase/Core/BaseObject) to inspect actual output.
