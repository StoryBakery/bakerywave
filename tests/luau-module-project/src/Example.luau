--[=[
    @class SimpleExample
    @category Showcase/Examples
    @tag example

    bakerywave 문서 생성을 보여주기 위한 가장 기본적인 예시 클래스입니다.
    복잡한 기능을 살펴보기 전에 이 클래스를 통해 기본적인 레이아웃을 확인하세요.

    **의도하는 문서 모습:**
    - 제목 밑에 `example` 태그가 나타납니다.
    - `Showcase/Examples` 카테고리에 분류됩니다.
]=]
local SimpleExample = {}
SimpleExample.__index = SimpleExample

--[=[
    @prop Name string
    객체의 이름입니다.
]=]
SimpleExample.Name = "Example"

--[=[
    @constructor new
    @param name string - 초기 이름 설정
    @return SimpleExample - 새로운 인스턴스

    새로운 SimpleExample 인스턴스를 생성합니다.
]=]
function SimpleExample.new(name: string)
	return setmetatable({
		Name = name or "Example",
	}, SimpleExample)
end

--[=[
    @param message string - 출력할 메시지
    콘솔에 메시지를 출력하는 간단한 메서드입니다.
]=]
function SimpleExample:SayHello(message: string)
	print(self.Name .. ": " .. message)
end

return SimpleExample
