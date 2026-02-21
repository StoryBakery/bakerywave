--[=[
    @class AnotherBaseFeature
    @category AnotherCategory/Features
]=]
local AnotherBaseFeature = {}
AnotherBaseFeature.__index = AnotherBaseFeature

--[=[
    @constructor new
    @return AnotherBaseFeature - AnotherCategory 기본 기능 인스턴스
]=]
function AnotherBaseFeature.new()
    return setmetatable({}, AnotherBaseFeature)
end

--[=[
    @param value string - 문자열 값
    @return string - 그대로 반환
]=]
function AnotherBaseFeature:Echo(value: string): string
    return value
end

--[=[
    @class AnotherDocFeatureClass
    @category AnotherCategory/Features
    @extends AnotherBaseFeature
]=]
local AnotherDocFeatureClass = {}
AnotherDocFeatureClass.__index = AnotherDocFeatureClass

--[=[
    @constructor new
    @return AnotherDocFeatureClass - AnotherCategory 예시 인스턴스
]=]
function AnotherDocFeatureClass.new()
    return setmetatable({}, AnotherDocFeatureClass)
end

--[=[
    @param value number - 입력 값
    @return number - 두 배 값
]=]
function AnotherDocFeatureClass:Double(value: number): number
    return value * 2
end

return {
    AnotherBaseFeature = AnotherBaseFeature,
    AnotherDocFeatureClass = AnotherDocFeatureClass,
}
