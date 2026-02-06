--[=[
    @class AdvancedTypes
    @category Showcase/Advanced
    @tag types

    복잡한 Luau 타입 시스템을 테스트하기 위한 클래스입니다.
    제네릭, 중첩된 테이블 타입, 함수 타입 링크 등을 검증합니다.
]=]
local AdvancedTypes = {}
AdvancedTypes.__index = AdvancedTypes

--[=[
    @interface NestedGeneric<T, U>
    @within AdvancedTypes
    @field data T -- 기본 데이터
    @field metadata U -- 메타데이터 정보
    @field children {NestedGeneric<T, U>} -- 재귀적 제네릭 정의

    재귀적 구조를 가진 제네릭 인터페이스입니다.
]=]
type NestedGeneric<T, U> = {
	data: T,
	metadata: U,
	children: { NestedGeneric<T, U> },
}

--[=[
    @group Types
    @param pipeline (source: string) -> (boolean, { [string]: any }) -- 복잡한 함수 파이프라인
    @return NestedGeneric<string, number> -- 제네릭 리턴 타입

    복잡한 함수 시그니처와 제네릭 리턴 타입을 가집니다.

    **문서 기대 사항:**
    - 파라미터 타입의 `string`, `boolean` 등이 기본 타입 링크로 연결되어야 합니다.
    - 리턴 타입 `NestedGeneric`이 인터페이스 문서로 링크되어야 합니다.
]=]
function AdvancedTypes:ComplexGenericTest(
	pipeline: (source: string) -> (boolean, { [string]: any })
): NestedGeneric<string, number>
	return nil :: any
end

--[=[
    @group Types
    @param callback (id: number) -> InteractiveObject -- 다른 클래스를 참조하는 콜백
    @return {InteractiveObject} -- 객체 배열

    다른 클래스(`InteractiveObject`)를 타입으로 참조하는 경우를 테스트합니다.

    **문서 기대 사항:**
    - `InteractiveObject`가 해당 클래스 문서로 자동 링크되어야 합니다.
]=]
function AdvancedTypes:ExternalClassReference(callback: (id: number) -> any): { any }
	return {}
end

return AdvancedTypes
