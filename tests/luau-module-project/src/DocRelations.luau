--[=[
    @class DocWidgetConfig
    @withinDefault DocWidgetConfig
    @category Docs/Relations
    @tag config

    위젯 구성 데이터입니다.
    이 설정은 `Classes.DocWidget`과 조합 관계로 사용됩니다.
    의도하는 UI는 다음과 같습니다:
    - 설정 패널에서 토글/색상/텍스트를 조합해 위젯을 구성
]=]
local DocWidgetConfig = {}
DocWidgetConfig.__index = DocWidgetConfig

--[=[
    @constructor new
    @param enabled boolean -- 활성 여부
    @param title string -- 표시 제목
    @param accent Color3 -- 강조 색상
    @return DocWidgetConfig -- 설정 인스턴스

    이것은 기본 설정을 만들고 `Classes.DocWidget`에 주입해야 합니다.
]=]
function DocWidgetConfig.new(enabled: boolean, title: string, accent: Color3)
	return setmetatable({
		Enabled = enabled,
		Title = title,
		Accent = accent,
	}, DocWidgetConfig)
end

--[=[
    @prop Enabled boolean -- 활성 여부
    @group Basics
]=]
DocWidgetConfig.Enabled = true

--[=[
    @prop Title string -- 화면에 표시될 제목
    @group Basics
]=]
DocWidgetConfig.Title = "Widget"

--[=[
    @prop Accent Color3 -- 강조 색상
    @group Basics
]=]
DocWidgetConfig.Accent = Color3.new(1, 1, 1)

--[=[
    @class DocWidgetState
    @withinDefault DocWidgetState
    @category Docs/Relations
    @tag state

    위젯의 실행 상태입니다.
    이 상태는 `Classes.DocWidget`이 내부적으로 소유합니다(조합 관계).
]=]
local DocWidgetState = {}
DocWidgetState.__index = DocWidgetState

--[=[
    @constructor new
    @return DocWidgetState -- 상태 인스턴스
]=]
function DocWidgetState.new()
	return setmetatable({
		Clicks = 0,
		LastUpdated = 0,
	}, DocWidgetState)
end

--[=[
    @prop Clicks number -- 클릭 횟수
    @group Metrics
]=]
DocWidgetState.Clicks = 0

--[=[
    @prop LastUpdated number -- 마지막 갱신 시간 (Global.RobloxGlobals.tick())
    @group Metrics
]=]
DocWidgetState.LastUpdated = 0

--[=[
    @class DocWidget
    @withinDefault DocWidget
    @category Docs/Relations
    @tag widget

    UI 위젯 본체입니다.
    이 클래스는 `Classes.DocWidgetConfig`를 주입받고,
    `Classes.DocWidgetState`를 내부에 생성해 관리합니다.

    이것은 설정과 상태를 조합하여 동작해야 합니다:
    1) 설정의 Enabled가 false면 렌더링을 중단
    2) Enabled가 true면 제목과 색상을 사용해 UI를 구성
]=]
local DocWidget = {}
DocWidget.__index = DocWidget

--[=[
    @constructor new
    @param config DocWidgetConfig -- 구성 데이터
    @return DocWidget -- 위젯 인스턴스

    의도하는 UI는 다음과 같습니다:
    - 헤더 텍스트는 `Class.TextLabel`로 렌더링
    - 클릭 이벤트는 `Class.GuiButton.Activated`를 사용
]=]
function DocWidget.new(config: DocWidgetConfig)
	local self = setmetatable({}, DocWidget)
	self.Config = config
	self.State = DocWidgetState.new()
	return self
end

--[=[
    @prop Config DocWidgetConfig -- 조합된 설정 객체
    @group Composition
]=]
DocWidget.Config = nil

--[=[
    @prop State DocWidgetState -- 내부 상태 객체
    @group Composition
]=]
DocWidget.State = nil

--[=[
    @event Changed
    @group Events
    @param key string -- 변경된 항목 키
    @param value any -- 변경된 값
    @param previous any -- 이전 값
    @param source string? -- [[
        변경을 발생시킨 원인입니다.
        `User`, `System`, `Sync` 값을 가정합니다.
    ]]

    상태가 변경될 때 호출됩니다.
    구현에서는 `Library.coroutine.create()`로 비동기 핸들러를 사용할 수 있습니다.
]=]
DocWidget.Changed = nil

--[=[
    @group Methods
    @param text string -- 제목 텍스트

    이것은 `Classes.DocWidgetConfig`의 Title을 갱신하고
    UI 텍스트를 다시 렌더링해야 합니다.
]=]
function DocWidget:SetTitle(text: string)
	self.Config.Title = text
	self.State.LastUpdated = tick()
end

--[=[
    @group Methods
    @return boolean -- 활성 여부

    `Class.GuiObject.Visible`에 대응하는 상태입니다.
]=]
function DocWidget:IsEnabled(): boolean
	return self.Config.Enabled
end

--[=[
    @group Methods
    @param enabled boolean -- 활성 여부

    이것은 `Class.GuiObject.Visible`처럼 UI의 표시 여부를 토글해야 합니다.
]=]
function DocWidget:SetEnabled(enabled: boolean)
	self.Config.Enabled = enabled
	self.State.LastUpdated = tick()
end

--[=[
    @group Methods
    @return number -- 클릭 횟수

    클릭 횟수는 `Classes.DocWidgetState.Clicks`를 반환합니다.
]=]
function DocWidget:GetClicks(): number
	return self.State.Clicks
end

--[=[
    @group Methods
    @param increment number -- 증가량
    @return number -- 갱신된 클릭 횟수

    이 함수는 내부 상태를 갱신하고,
    `Classes.DocWidget.Changed` 이벤트를 발생시켜야 합니다.
]=]
function DocWidget:IncrementClicks(increment: number): number
	self.State.Clicks += increment
	self.State.LastUpdated = tick()
	return self.State.Clicks
end

return {
	DocWidget = DocWidget,
	DocWidgetConfig = DocWidgetConfig,
	DocWidgetState = DocWidgetState,
}
