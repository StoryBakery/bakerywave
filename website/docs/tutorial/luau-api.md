---
title: 4. Luau API 문서화
sidebar_position: 4
---

# 4. Luau API 문서화

Bakerywave의 가장 강력한 기능, **Luau 코드 주석을 문서로 바꾸는 방법**을 알아봅시다.

## 1. Luau 파일 준비

`src/` 폴더 안에 `MyModule.luau` 파일을 하나 만들고 아래 내용을 복사해 붙여넣으세요.

```lua
--[=[
    @class MyModule
    
    이 모듈은 Bakerywave 튜토리얼을 위해 만들어졌습니다.
    간단한 수학 계산 기능을 제공합니다.
]=]
local MyModule = {}

--[=[
    두 숫자를 더합니다.

    @param a number - 첫 번째 숫자
    @param b number - 두 번째 숫자
    @return number - 더한 결과
]=]
function MyModule.add(a: number, b: number): number
    return a + b
end

return MyModule
```

핵심은 `--[=[ ... ]=]` 형태의 주석입니다. 여기에 설명을 적으면 문서가 됩니다.

## 2. 설정 확인

프로젝트 루트에 있는 `bakerywave.toml` 파일을 열어 `[reference]` 부분이 있는지 확인하세요. 기본으로 설정되어 있을 겁니다.

```toml
[reference]
lang = "luau"
srcDir = "src"          # 소스 코드가 있는 폴더
input = ".generated/reference/luau.json"
outDir = "docs/reference/luau" # 문서가 생성될 폴더
```

## 3. 문서 생성하기

서버가 켜져 있는 상태라면 터미널을 하나 더 열고(또는 서버를 끄고) 아래 명령어를 입력합니다.

```bash
bakerywave reference build --site-dir .
# 또는 npm 스크립트에 등록되어 있다면:
npm run reference:build
```

명령어가 성공하면 `docs/reference/luau` 폴더 안에 여러 `.mdx` 파일들이 자동으로 생겨납니다.

## 4. 사이드바 확인

이제 다시 개발 서버(`npm run dev`) 화면을 보세요.
사이드바에 **"Reference"** 메뉴가 생겼을 것입니다. 클릭해서 들어가 보면 방금 작성한 `MyModule`에 대한 문서가 멋지게 만들어져 있을 겁니다!

---

이제 기본적인 사용법은 모두 익혔습니다! 🎉
더 자세한 설정이나 고급 기능이 궁금하다면 [가이드 문서](../guides/configuration.md)를 참고하세요.
