---
title: bakerywave 흐름 테스트
sidebar_label: bakerywave 흐름
---

# bakerywave 흐름 테스트

이 문서는 bakerywave CLI 기능을 빠르게 확인하기 위한 테스트용 페이지입니다.

## init
```
bakerywave init my-docs
bakerywave init my-docs --no-install
```

## dev
```
bakerywave dev --site-dir website
```

## reference
```
bakerywave reference build --site-dir website
bakerywave reference watch --site-dir website
```

## i18n
```
bakerywave write-translations --site-dir website -- --locale ko
```

## 설정 파일
- `bakerywave.toml`에 reference/i18n 옵션을 둘 수 있습니다.
