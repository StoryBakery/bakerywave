---
title: 3. 문서 직접 쓰기
sidebar_position: 3
---

# 3. 문서 직접 쓰기

이제 본격적으로 여러분의 내용을 담은 문서를 작성해봅시다.

## 새 파일 만들기

`docs/` 폴더 안에 새로운 파일 `hello.md`를 만들어보세요.

```markdown
---
title: 안녕, Bakerywave!
sidebar_position: 1
---

# 안녕하세요?

이것은 제가 **처음으로 만든** 문서입니다.

## 목록 예시
- 쉽다
- 빠르다
- 예쁘다
```

파일을 저장하면 브라우저 사이드바 맨 위에 "안녕, Bakerywave!"라는 메뉴가 생긴 것을 볼 수 있습니다.

## Frontmatter 란?

문서 맨 위에 `---`로 감싸진 부분을 **Frontmatter(프론트매터)**라고 합니다. 문서의 설정을 적는 곳입니다.

*   `title`: 문서의 제목입니다. (브라우저 탭 이름, 검색 결과에 사용됨)
*   `sidebar_label`: 사이드바(메뉴)에 표시될 짧은 이름입니다. (생략하면 title을 씀)
*   `sidebar_position`: 사이드바에서 몇 번째에 위치할지 정하는 숫자입니다. (낮을수록 위로 감)

## 폴더로 정리하기

문서가 많아지면 폴더를 만들어 정리할 수 있습니다.
`docs/guides/` 폴더를 만들고 그 안에 `installation.md`를 넣으면, 사이드바에도 "Guides"라는 그룹이 자동으로 생깁니다.
문서 폴더는 프로젝트 목적에 맞게 자유롭게 늘릴 수 있습니다. 예를 들어 `docs/intro`, `docs/tutorial`, `docs/development`처럼 구성해도 됩니다.

### 운영 기준

- `guides`(또는 원하는 이름)는 일반 문서를 묶는 사이드바 그룹 이름입니다.
- 일반 문서는 `docs/` 아래에서 원하는 폴더 구조로 관리합니다.
- `docs/reference/`는 `bakerywave reference build`가 생성하는 영역이므로 수동 편집하지 않습니다.

이를 더 세밀하게 제어하고 싶다면 `_category_.json` 파일을 사용하거나 `sidebars.js`를 수정할 수 있습니다. (나중에 [심화 가이드](../guides/customization.md)에서 다룹니다)

## 더 배우기

이제 기초를 익혔으니, 더 멋진 문서를 만들기 위한 가이드를 확인해보세요.

- [**Markdown 문법 가이드**](../writing/markdown.md): 텍스트 스타일, 목록, 표 등을 만드는 방법
- [**MDX 확장 문법**](../writing/mdx.md): React 컴포넌트, 탭, 경고 박스 사용법
- [**React 컴포넌트 가이드**](../writing/react-components.md): 컴포넌트 계열별 속성과 예시
- [**API 링크 (백틱)**](../writing/api-links.md): `Class.Part` 같은 링크를 쉽게 거는 방법
