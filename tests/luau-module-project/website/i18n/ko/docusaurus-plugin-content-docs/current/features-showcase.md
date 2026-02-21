# Docgen Feature Showcase

이 문서는 `bakerywave`의 문서 생성기(Docgen)가 지원하는 모든 주요 시그니처와 태그들을 한눈에 확인할 수 있는 가이드입니다.
`Reference` 섹션의 `Showcase` 관련 클래스들을 통해 실제 렌더링 결과를 확인할 수 있습니다.

## 1. 상속 및 계층 구조 (Inheritance)
- **복잡한 상속 구조**: `BaseObject` -> `InteractiveObject` -> `ComplexComponent`로 이어지는 3단계 상속 구조를 지원합니다.
- **상속된 멤버 표시**: 로블록스 공식 문서 스타일의 리스트를 통해 부모 클래스로부터 물려받은 속성과 메서드를 확인할 수 있습니다.
- **Inherited By**: 부모 클래스 하단에서 해당 클래스를 상속받는 자식 클래스들의 링크를 제공합니다.

## 2. 태그 및 배지 (Tags & Badges)
다양한 메타데이터 태그가 배지 형태로 시각화됩니다:
- `@readonly`: 읽기 전용 속성 표시.
- `@deprecated`: 지원 중단된 기능에 대한 경고.
- `@server` / `@client` / `@plugin`: 실행 환경 제약 조건 표시.
- `@yields`: 비동기적으로 동작하여 실행이 일시 중단될 수 있음을 표시.
- `@unreleased`: 아직 출시되지 않은 실험적 기능 표시.

## 3. 요약 및 그룹화 (Summary & Groups)
- **Summary 섹션**: 클래스 상단에서 아이콘과 함께 멤버들을 한눈에 볼 수 있는 요약 테이블을 제공합니다.
- **@group**: 관련 있는 멤버들을 논리적으로 묶어 별도의 섹션으로 표시합니다. (예: Configuration, Lifecycle, Events)

## 4. 타입 시스템 (Type System)
- **자동 링크 (Linkifying)**: 파라미터나 리턴 타입에서 다른 클래스나 인터페이스 이름을 언급하면 자동으로 해당 문서로 연결됩니다.
- **복잡한 타입 지원**: 제네릭(`NestedGeneric<T, U>`), 함수 타입, 중첩된 테이블 타입 등을 선명하게 렌더링합니다.

## 5. 카테고리 (Categories)
- **깊은 중첩**: `Tests/Deep/Nested/Category`와 같이 여러 단계의 카테고리를 지원합니다.
- **다중 카테고리**: 한 클래스가 여러 카테고리에 동시에 속할 수 있습니다.

---

실제 결과물은 [Reference -> Showcase/Core -> BaseObject](/reference/luau/Showcase/Core/BaseObject) 등에서 시작하여 탐색해보세요!
