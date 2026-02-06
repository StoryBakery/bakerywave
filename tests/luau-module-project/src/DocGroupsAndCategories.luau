--[=[
    @class CategoryTest
    @category Tests/Deep/Nested/Category
    @tag category-test

    깊게 중첩된 카테고리 구조를 테스트합니다.
    사이드바에서 `Tests > Deep > Nested > Category` 순으로 나타나야 합니다.
]=]
local CategoryTest = {}

--[=[
    @group First Group
    그룹 1의 메서드입니다.
]=]
function CategoryTest:MethodA() end

--[=[
    @group Second Group
    그룹 2의 메서드입니다.
]=]
function CategoryTest:MethodB() end

--[=[
    @class MultiCategory
    @category Tests/A
    @category Tests/B
    @tag multi-category

    여러 카테고리에 동시에 속하는 클래스입니다.
    `Tests/A`와 `Tests/B` 두 곳 모두에 나타나야 합니다.
]=]
local MultiCategory = {}

return {
	CategoryTest = CategoryTest,
	MultiCategory = MultiCategory,
}
