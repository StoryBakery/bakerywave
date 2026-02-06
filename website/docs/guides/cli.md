---
title: CLI 명령어
sidebar_position: 2
---

# CLI 명령어

Bakerywave가 제공하는 모든 명령어와 옵션에 대한 상세 가이드입니다.

기본 사용법:
```bash
bakerywave <command> [options]
```

## init
새로운 문서 사이트 프로젝트를 생성합니다.

```bash
bakerywave init <project-name> [options]
```

| 옵션                       | 설명                                                                     |
| -------------------------- | ------------------------------------------------------------------------ |
| `--no-install`             | 템플릿 생성 후 `npm install`을 자동으로 실행하지 않습니다.               |
| `--force`                  | 대상 폴더가 비어있지 않아도 강제로 생성합니다. (주의: 기존 파일 덮어씀)  |
| `--template <path>`        | 사용자 지정 템플릿 경로를 사용합니다.                                    |
| `--package-manager <name>` | 사용할 패키지 매니저를 지정합니다. (`npm`, `yarn`, `pnpm`, `bun` 중 택1) |

## start (또는 dev)
개발 서버를 실행합니다. 파일이 변경되면 자동으로 브라우저를 새로고침합니다.

```bash
bakerywave start [options]
# 또는
bakerywave dev [options]
```

| 옵션               | 설명                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| `--site-dir <dir>` | 사이트 디렉토리 경로를 지정합니다. (기본값: 현재 폴더 또는 `website`) |
| `--no-restart`     | 설정 파일 변경 시 서버를 자동으로 재시작하지 않습니다.                |
| `--dev-watch-cli`  | (개발자용) CLI 코드 변경을 감지하여 재시작합니다.                     |

## build
배포용 정적 웹사이트(HTML/CSS/JS)를 빌드합니다. 결과물은 `build` 폴더에 생성됩니다.

```bash
bakerywave build [options]
```

## reference build
소스 코드를 분석하여 API 레퍼런스 문서를 생성합니다.
보통 `start`나 `build` 전에 실행해야 합니다.

```bash
bakerywave reference build [options]
```

| 옵션                | 설명                                                           |
| ------------------- | -------------------------------------------------------------- |
| `--site-dir <dir>`  | 설정을 읽어올 사이트 디렉토리를 지정합니다.                    |
| `--no-clean`        | 생성 전에 출력 폴더를 비우지 않습니다.                         |
| `--fail-on-warning` | 경고가 발생하면 에러로 처리하고 종료합니다. (CI 환경에서 유용) |
| `--legacy`          | (디버깅용) 네이티브 파서 대신 구형 JS 파서를 사용합니다.       |

## serve
`build` 명령어로 생성된 정적 웹사이트를 로컬에서 미리 확인합니다.

```bash
bakerywave serve
```
