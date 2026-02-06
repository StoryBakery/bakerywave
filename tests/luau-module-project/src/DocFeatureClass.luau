--[=[
    @class BaseFeature
    @withinDefault BaseFeature
    @category Docs/Features
    @tag base
]=]
local BaseFeature = {}
BaseFeature.__index = BaseFeature

--[=[
    @constructor new
    @return BaseFeature -- 기본 기능 인스턴스
]=]
function BaseFeature.new()
    return setmetatable({}, BaseFeature)
end

--[=[
    @group Base
    @param value string -- 문자열 값
    @return string -- 그대로 반환
]=]
function BaseFeature:Echo(value: string): string
    return value
end

--[=[
    @class DocFeatureClass
    @withinDefault DocFeatureClass
    @category Docs/Features
    @tag example
    @extends BaseFeature
    @since 1.0.0
    @__index DocFeatureClass
    @external RobloxBasePart https://create.roblox.com/docs/reference/engine/classes/BasePart
]=]
local DocFeatureClass = {}
DocFeatureClass.__index = DocFeatureClass

--[=[
    @constructor new
    @return DocFeatureClass -- 예시 인스턴스
]=]
function DocFeatureClass.new()
    return setmetatable({}, DocFeatureClass)
end

--[=[
    @prop Enabled boolean -- 활성화 여부
    @group Basics
]=]
DocFeatureClass.Enabled = true

--[=[
    @readonly
    @group Basics
]=]
DocFeatureClass.ReadOnly = 123

--[=[
    @group Basics
    @param value number -- 입력 값
    @return number -- 두 배 값
]=]
function DocFeatureClass:Double(value: number): number
    return value * 2
end

--[=[
    @group Advanced
    @param value number -- 입력 값
    @error string -- 음수 입력 시 오류
    @yields
]=]
function DocFeatureClass:MaybeYield(value: number)
    if value < 0 then
        error("negative")
    end
    task.wait(0)
    return value
end

--[=[
    @deprecated 1.1.0 -- 더 이상 사용되지 않습니다.
    @group Advanced
]=]
function DocFeatureClass:OldMethod()
    return nil
end

--[=[
    @unreleased
    @group Advanced
]=]
function DocFeatureClass:UnreleasedFeature()
    return true
end

--[=[
    @server
    @group Realms
]=]
function DocFeatureClass:ServerOnly()
    return true
end

--[=[
    @client
    @group Realms
]=]
function DocFeatureClass:ClientOnly()
    return true
end

--[=[
    @plugin
    @group Realms
]=]
function DocFeatureClass:PluginOnly()
    return true
end

--[=[
    @event Changed
    @group Events
    @param property string -- 변경된 속성 이름
    @param value any -- 새 값
    @param oldValue any -- 이전 값
]=]
DocFeatureClass.Changed = nil

--[=[
    @event Refreshed
    @group Events
    @since 1.2.0
    @param reason string -- [[
        갱신 사유입니다.
        `manual` 또는 `auto` 값을 가정합니다.
        @default manual
    ]]
]=]
DocFeatureClass.Refreshed = nil

--[=[
    @within DocFeatureClass
    @group Basics
    @param value number -- 입력 값
    @return number -- 그대로 반환
]=]
function DocFeatureClass.Static(value: number): number
    return value
end

--[=[
    @private
]=]
DocFeatureClass._Internal = true

--[=[
    @ignore
]=]
DocFeatureClass._Ignored = true

return {
    BaseFeature = BaseFeature,
    DocFeatureClass = DocFeatureClass,
}
