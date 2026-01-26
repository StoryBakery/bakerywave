# luau-module-project (테스트용)

릴리즈 전 빌드 검증을 위해 사용하는 테스트 프로젝트입니다.
실제 배포 대상이 아닙니다.

구성:
- `src/`: Luau 코드
- `website/`: Docusaurus 사이트

테스트 실행:
- `tests/luau-module-project/website`에서 `npm run test`

로컬 개발:
- `tests/luau-module-project/website`에서 `npm run dev`
- `bakerywave reference watch`와 `bakerywave start`가 함께 실행된다.

reference 출력:
- `website/docs/reference/luau`에 생성된다.
- 생성물은 Git 추적하지 않는다.

설정:
- `tests/luau-module-project/bakerywave.toml`에서 reference 경로와 정책을 관리한다.

요구사항:
- 별도의 추출기 설치 없이 실행된다.
