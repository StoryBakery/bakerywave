--[=[
    @class BaseObject
    @withinDefault BaseObject
    @category Showcase/Core
    @tag base
    @since 1.0.0
    @external RobloxInstance https://create.roblox.com/docs/reference/engine/classes/Instance

    모든 쇼케이스 객체의 최상위 기반 클래스입니다.
    이 클래스는 객체의 생명주기와 아이덴티티를 관리하는 기본적인 기능을 제공합니다.

    **의도하는 문서 모습:**
    - `Showcase/Core` 카테고리 안에 위치합니다.
    - `base` 태그가 배지로 표시됩니다.
    - 상속 계층의 가장 뿌리가 됩니다.
]=]
local BaseObject = {}
BaseObject.__index = BaseObject

--[=[
    @prop ID string
    @readonly
    @group Identity
    객체의 유니크한 식별자입니다. 생성 시 한 번만 설정되며 변경할 수 없습니다.

    **문서 기대 사항:**
    - `ReadOnly` 배지가 이름 옆에 붙어야 합니다.
    - `Identity` 그룹 섹션에 분류됩니다.
]=]
BaseObject.ID = ""

--[=[
    @constructor new
    @param id string -- 객체의 고유 ID
    @return BaseObject -- 생성된 객체 인스턴스

    새로운 BaseObject를 생성합니다.
]=]
function BaseObject.new(id: string)
	local self = setmetatable({}, BaseObject)
	self.ID = id or "base_obj"
	return self
end

--[=[
    @group Lifecycle
    객체를 파괴하고 메모리에서 해제합니다.
    내부적으로 사용하던 모든 리소스를 정리하므로 호출 후에는 객체를 사용하지 마십시오.
]=]
function BaseObject:Destroy()
	-- cleanup logic
end

--[=[
    @class InteractiveObject
    @extends BaseObject
    @category Showcase/Core
    @tag interactive
    @since 1.1.0

    상호작용이 가능한 객체를 위한 클래스입니다.
    `BaseObject`를 상속받아 이벤트 및 비동기 처리 기능을 추가합니다.

    **의도하는 문서 모습:**
    - `Inherited Members` 섹션에 `BaseObject`의 `ID`, `Destroy` 등이 나타나야 합니다.
    - `Inherited From` 링크가 `BaseObject`로 연결되어야 합니다.
]=]
local InteractiveObject = {}
InteractiveObject.__index = InteractiveObject
setmetatable(InteractiveObject, BaseObject)

--[=[
    @event Activated
    @group Events
    @param timestamp number -- 활성화된 시점의 tick
    @param source string -- 입력 소스 (Mouse/Touch/Gamepad)
    객체가 활성화되었을 때 발생하는 이벤트입니다.

    **문서 기대 사항:**
    - `Events` 섹션에 노란색 번개 아이콘과 함께 표시되어야 합니다.
]=]
InteractiveObject.Activated = nil

--[=[
    @yields
    @group Processing
    @param data table -- 처리할 데이터 패킷
    @return boolean -- 처리 성공 여부
    @error string -- 데이터 형식이 잘못된 경우 발생
    데이터를 비동기적으로 처리합니다. 내부적으로 `task.wait()`를 호출할 수 있습니다.

    **문서 기대 사항:**
    - `Yields` 배지가 표시되어야 합니다.
    - `@error` 내용이 설명 하단에 주의사항처럼 표시되어야 합니다.
]=]
function InteractiveObject:ProcessAsync(data: { [any]: any }): boolean
	task.wait(1)
	return true
end

--[=[
    @deprecated 1.2.0 -- 대신 `ProcessAsync`를 사용하십시오.
    @group Processing
    이전 버전에서 사용하던 동기식 처리 메서드입니다.

    **문서 기대 사항:**
    - `Deprecated` 배지가 눈에 띄게 표시되어야 하며, 줄 취소 선(strikethrough) 스타일이 적용될 수 있습니다.
]=]
function InteractiveObject:OldAction()
	return nil
end

--[=[
    @interface IConfig
    @within ComplexComponent
    @field enabled boolean -- 컴포넌트 활성화 여부
    @field theme "Dark" | "Light" -- 테마 설정
    @field padding number? -- 선택적 패딩 값

    컴포넌트 설정을 위한 인터페이스 정의입니다.
]=]
type IConfig = {
	enabled: boolean,
	theme: "Dark" | "Light",
	padding: number?,
}

--[=[
    @class ComplexComponent
    @extends InteractiveObject
    @category Showcase/Components
    @tag premium
    @since 2.0.0
    @unreleased

    가장 복잡한 기능을 담고 있는 상위 컴포넌트입니다.
    다중 계층 구조를 테스트하기 위해 설계되었습니다.

    **의도하는 문서 모습:**
    - `Inherited Members`에서 `BaseObject`와 `InteractiveObject`의 멤버가 모두 나타나야 합니다.
]=]
local ComplexComponent = {}
ComplexComponent.__index = ComplexComponent
setmetatable(ComplexComponent, InteractiveObject)

--[=[
    @class DeepNestedComponent
    @extends ComplexComponent
    @category Showcase/Components
    @tag deepest
    @since 2.1.0

    매우 깊은 상속 단계(Level 3)를 테스트하기 위한 클래스입니다.
    `BaseObject` ➔ `InteractiveObject` ➔ `ComplexComponent` ➔ `DeepNestedComponent`

    **의도하는 문서 모습:**
    - `Inherited Members` 섹션에 부모, 조부모, 증조부모 클래스의 멤버가 모두 나열되어야 합니다.
]=]
local DeepNestedComponent = {}
DeepNestedComponent.__index = DeepNestedComponent
setmetatable(DeepNestedComponent, ComplexComponent)

--[=[
    @class UltimateComponent
    @extends DeepNestedComponent
    @category Showcase/Components
    @tag ultimate
    @since 3.0.0

    가장 깊은 상속 단계(Level 4)를 테스트하기 위한 클래스입니다.
    `BaseObject` -> `InteractiveObject` -> `ComplexComponent` -> `DeepNestedComponent` -> `UltimateComponent`

    **의도하는 문서 모습:**
    - 상속받은 모든 레이어의 멤버들이 올바르게 누적되어 표시되는지 확인합니다.
]=]
local UltimateComponent = {}
UltimateComponent.__index = UltimateComponent
setmetatable(UltimateComponent, DeepNestedComponent)

--[=[
    @group Execution
    가장 깊은 레벨에서 추가된 기능입니다.
]=]
function DeepNestedComponent:DeepAction() end

--[=[
    @group Execution
    궁극의 컴포넌트 기능입니다.
]=]
function UltimateComponent:UltimateAction() end

--[=[
    @class UIComponent
    @extends InteractiveObject
    @category Showcase/Components
    @tag ui

    상속 트리가 갈라지는 모습(Branching)을 테스트합니다.
    `InteractiveObject`를 부모로 하는 또 다른 클래스입니다.
]=]
local UIComponent = {}
UIComponent.__index = UIComponent
setmetatable(UIComponent, InteractiveObject)

--[=[
    @class AnimationComponent
    @extends InteractiveObject
    @category Showcase/Components
    @tag animation

    `InteractiveObject`를 상속받는 또 다른 클래스입니다. (다중 자식 테스트)
]=]
local AnimationComponent = {}
AnimationComponent.__index = AnimationComponent
setmetatable(AnimationComponent, InteractiveObject)

--[=[
    @class SoundComponent
    @extends InteractiveObject
    @category Showcase/Components
    @tag sound

    `InteractiveObject`를 상속받는 또 다른 클래스입니다. (다중 자식 테스트)
]=]
local SoundComponent = {}
SoundComponent.__index = SoundComponent
setmetatable(SoundComponent, InteractiveObject)

--[=[
    @class PhysicsComponent
    @extends InteractiveObject
    @category Showcase/Components
    @tag physics

    `InteractiveObject`를 상속받는 또 다른 클래스입니다. (다중 자식 테스트)
]=]
local PhysicsComponent = {}
PhysicsComponent.__index = PhysicsComponent
setmetatable(PhysicsComponent, InteractiveObject)

--[=[
    @class DataComponent
    @extends InteractiveObject
    @category Showcase/Components
    @tag data

    데이터 처리에 특화된 `InteractiveObject`의 또 다른 자식 클래스입니다.
]=]
local DataComponent = {}
DataComponent.__index = DataComponent
setmetatable(DataComponent, InteractiveObject)

--[=[
    @class CoreService
    @extends BaseObject
    @category Showcase/Core
    @tag service

    최상위 `BaseObject`로부터 직접 갈라져 나오는 서비스 클래스입니다.
]=]
local CoreService = {}
CoreService.__index = CoreService
setmetatable(CoreService, BaseObject)

--[=[
    @prop Config IConfig
    @group Configuration
    컴포넌트의 현재 설정 상태입니다. `IConfig` 인터페이스 타입을 사용합니다.
]=]
ComplexComponent.Config = {
	enabled = true,
	theme = "Dark",
}

--[=[
    @server
    @group Execution
    서버 측에서만 실행되어야 하는 로직입니다. 서버 데이터베이스와 통신합니다.

    **문서 기대 사항:**
    - `Server` 전용 배지가 표시되어야 합니다.
]=]
function ComplexComponent:SyncWithDatabase()
	-- server side only
end

--[=[
    @client
    @group Execution
    클라이언트 측에서만 실행되는 렌더링 로직입니다.

    **문서 기대 사항:**
    - `Client` 전용 배지가 표시되어야 합니다.
]=]
function ComplexComponent:Render()
	-- client side only
end

--[=[
    @plugin
    @group Studio
    로블록스 스튜디오 플러그인 환경에서만 사용할 수 있는 메서드입니다.

    **문서 기대 사항:**
    - `Plugin` 배지가 표시되어야 합니다.
]=]
function ComplexComponent:OpenEditor()
	-- plugin only
end

--[=[
    @class ShowcaseLibrary
    @category Showcase/API
    @tag utility

    이것은 인스턴스화할 수 없는 정적 유틸리티 라이브러리입니다.
    전역적으로 접근 가능한 순수 함수들을 포함합니다.
]=]
local ShowcaseLibrary = {}

--[=[
    @within ShowcaseLibrary
    @param value any -- 평가할 값
    @return boolean -- 결과
    값이 유효한지 검사합니다.
]=]
function ShowcaseLibrary.IsValid(value: any): boolean
	return value ~= nil
end

--[=[
    @type CustomHandler (name: string, id: number) -> boolean
    @within ShowcaseLibrary
    특수 핸들러를 정의하기 위한 함수 타입입니다.
]=]
export type CustomHandler = (name: string, id: number) -> boolean

return {
	BaseObject = BaseObject,
	InteractiveObject = InteractiveObject,
	ComplexComponent = ComplexComponent,
	DeepNestedComponent = DeepNestedComponent,
	UltimateComponent = UltimateComponent,
	UIComponent = UIComponent,
	AnimationComponent = AnimationComponent,
	SoundComponent = SoundComponent,
	PhysicsComponent = PhysicsComponent,
	DataComponent = DataComponent,
	CoreService = CoreService,
	ShowcaseLibrary = ShowcaseLibrary,
}
