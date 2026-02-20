---
title: 설치하기
sidebar_position: 2
---

# 설치하기

Bakerywave를 사용하기 위한 준비 과정을 안내합니다.

## 1. Node.js 설치
Bakerywave는 **Node.js** 환경에서 실행됩니다.  
컴퓨터에 Node.js가 설치되어 있지 않다면, 공식 웹사이트에서 `LTS` (Long Term Support) 버전을 다운로드하여 설치해주세요.

*   [Node.js 다운로드 (공식)](https://nodejs.org/)

설치가 끝났다면 터미널(CMD, PowerShell 등)을 열고 다음 명령어를 입력하여 잘 설치되었는지 확인해보세요.

```bash
node -v
```
`v18.0.0` 이상의 숫자가 나온다면 성공입니다!

## 2. Bakerywave 설치 (선택 사항)
Bakerywave를 전역(Global)으로 설치하면 어디서든 `bakerywave` 명령어를 사용할 수 있어 편리합니다.

```bash
npm install -g @storybakery/bakerywave
```

설치가 완료되면 버전을 확인해봅시다.

```bash
bakerywave --version
```

<Alert severity="info">
<AlertTitle>추천: npx 사용하기</AlertTitle>
굳이 컴퓨터에 설치하지 않고도, 필요할 때만 최신 버전을 바로 실행하는 `npx` 방식을 가장 추천합니다.

이후 가이드에서는 여러분이 전역으로 설치했다고 가정하고 `bakerywave` 명령어를 사용하지만, 설치하지 않았다면 명령어 앞에 `npx`를 붙여서 `npx @storybakery/bakerywave` (또는 줄여서 `npx bakerywave`)로 실행할 수도 있습니다.
</Alert>

## 3. VSCode 설치 (권장)
문서를 작성할 때는 [Visual Studio Code](https://code.visualstudio.com/) 에디터를 추천합니다.
*   마크다운 문법 강조
*   편리한 파일 관리
*   통합 터미널

이제 모든 준비가 끝났습니다. 나만의 문서 사이트를 만들어볼까요?
