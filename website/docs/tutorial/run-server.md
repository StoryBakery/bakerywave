---
title: 2. 미리보기 서버 실행
sidebar_position: 2
---

# 2. 미리보기 서버 실행

사이트를 만들었으니, 내 컴퓨터에서 결과를 확인해봐야겠죠?
이를 **개발 서버(Dev Server)**라고 부릅니다. 문서를 수정하면 바로바로 반영해주기 때문에 편리합니다.

## 서버 실행하기

방금 만든 프로젝트 폴더(`my-docs`) 안에서 아래 명령어를 입력하세요.

```bash
npm run dev
```

또는 `bakerywave` 명령어로 직접 실행할 수도 있습니다.
```bash
bakerywave dev
```

참고:
- 기본 템플릿의 `npm run dev`는 `npm run reference:build && bakerywave start` 흐름을 사용합니다.
- `bakerywave dev`는 `reference watch`를 포함한 개발자용 모드입니다.

## 결과 확인

명령어를 실행하면 터미널에 여러 로그가 올라오다가, 마지막에 주소(`http://localhost:3000`)가 뜹니다.
보통은 자동으로 브라우저 창이 열리면서 사이트가 뜹니다.

개발 서버가 정상 실행되면 브라우저에서 사이트 홈 화면이 열립니다.

축하합니다! 여러분만의 문서 사이트가 실행되었습니다. 🎉

## 실시간 업데이트

서버를 끄지 않은 상태에서 `docs/intro.md` 같은 파일을 열어 내용을 살짝 수정하고 저장해보세요.
브라우저를 새로고침하지 않아도 내용이 **즉시 바뀌는 것**을 볼 수 있습니다. 이것이 바로 **Hot Reload** 기능입니다.

<Alert severity="info">
<AlertTitle>서버 종료하기</AlertTitle>
서버를 끄고 싶다면 터미널에서 `Ctrl + C` 키를 누르면 됩니다.
</Alert>
