---
title: 1. 사이트 만들기
sidebar_position: 1
---

# 1. 문서 사이트 만들기

가장 먼저 할 일은 문서 사이트의 뼈대(프로젝트)를 만드는 것입니다.
Bakerywave는 `init` 명령어를 통해 필요한 파일들을 자동으로 생성해줍니다.

## 프로젝트 생성

터미널을 열고, 프로젝트를 만들고 싶은 폴더로 이동한 뒤 아래 명령어를 입력하세요.
`my-docs` 자리에는 여러분이 원하는 프로젝트 이름을 넣으면 됩니다.

```bash
bakerywave init my-docs
```

<Alert severity="info">
<AlertTitle>npx를 사용하는 경우</AlertTitle>
Bakerywave를 설치하지 않았다면:

```bash
npx @storybakery/bakerywave init my-docs
```
</Alert>

명령어를 실행하면 잠시 후 `my-docs`라는 폴더가 생기고, 그 안에 필요한 파일들이 채워집니다.

## 폴더 구조 살펴보기

생성된 폴더 안으로 들어가 볼까요?

```bash
cd my-docs
```

주요 파일과 폴더는 다음과 같습니다.

*   📂 **`docs/`**: 여러분이 작성할 **문서 파일(.md)**들이 저장되는 곳입니다.
*   📂 **`src/`**: 이미지, CSS 스타일, Luau 소스 코드 등이 위치합니다.
*   📄 **`bakerywave.toml`**: Bakerywave의 설정을 담은 파일입니다.
*   📄 **`docusaurus.config.js`**: 사이트의 제목, 메뉴바 링크 등 전반적인 설정을 담당합니다.
*   📄 **`package.json`**: 프로젝트 정보와 실행 스크립트가 담겨 있습니다.

`bakerywave.toml`에는 Bakerywave 확장 기능 기본값이 들어 있습니다.
필요 없는 항목은 지워가며 쓰면 되고, `site.*` 항목을 비우면 Docusaurus 기본 동작에 가깝게 운영할 수 있습니다.

이 구조만 잘 이해하면 반은 성공입니다! 다음 단계에서는 이 사이트를 실제로 실행해보겠습니다.
