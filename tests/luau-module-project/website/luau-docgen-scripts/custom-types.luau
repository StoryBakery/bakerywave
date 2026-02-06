local source = require("../../src/DocgenTypeAnnotations")

local customTypes = {}
for _, entry in ipairs(source) do
	table.insert(customTypes, {
		name = entry.Name,
		type = entry.TypeAnnotation,
		description = entry.Description,
	})
end

return {
	classes = {
		{
			name = "DocgenTypes",
			category = "Showcase/Advanced",
			description = "문서 주석으로 표현하기 어려운 타입 이름을 docgen 스크립트에서 제공합니다.",
			types = customTypes,
		},
		{
			name = "DocgenMembers",
			category = "Showcase/Advanced",
			description = "docgen 스크립트에서 props/methods/events/interfaces/groups를 확인하기 위한 클래스입니다.",
			props = {
				{
					name = "Version",
					type = "string",
					readonly = true,
					description = "현재 포맷 버전입니다.",
					group = "Meta",
				},
			},
			methods = {
				{
					name = "Resolve",
					description = "입력 값을 해석합니다.",
					params = {
						{ name = "input", type = "string", description = "입력 문자열" },
						{ name = "strict", type = "boolean", description = "엄격 모드", default = "false" },
					},
					returns = {
						{ type = "boolean", description = "해석 성공 여부" },
					},
					errors = {
						{ type = "string", description = "해석 실패 이유" },
					},
					group = "Core",
				},
			},
			events = {
				{
					name = "Resolved",
					description = "해석이 완료되었을 때 발생합니다.",
					params = {
						{ name = "ok", type = "boolean", description = "성공 여부" },
						{ name = "message", type = "string", description = "결과 메시지" },
					},
					group = "Events",
				},
			},
			interfaces = {
				{
					name = "ResolveOptions",
					description = "Resolve 호출 옵션입니다.",
					fields = {
						{ name = "timeout", type = "number?", description = "타임아웃(초)" },
						{ name = "retry", type = "number", description = "재시도 횟수" },
					},
					group = "Core",
				},
			},
			groups = {
				["기타"] = {
					methods = {
						{
							name = "Dump",
							description = "디버그 문자열을 반환합니다.",
							returns = {
								{ type = "string", description = "디버그 출력" },
							},
						},
					},
					types = {
						{
							name = "DebugMode",
							type = '"Off" | "On"',
							description = "디버그 모드 타입입니다.",
						},
					},
				},
			},
		},
		{
			name = "DocgenMultiLine",
			category = "Showcase/Advanced",
			description = [[
여러 줄 설명 테스트 클래스입니다.\z
				문장 줄바꿈, 기본 그룹, 태그, 다양한 멤버 포맷을 한 번에 검증합니다.
]],
			group = "DefaultGroup",
			tags = {
				"scripted",
				{ name = "since", value = "0.9.0" },
			},
			props = {
				{
					name = "Summary",
					type = "string",
					readonly = true,
					description = [[
						여러 줄 속성 설명입니다.\z
						두 번째 줄도 정상적으로 보이는지 확인합니다.\z
					]],
				},
				{
					Name = "Counter",
					TypeAnnotation = "number",
					description = "대문자 키(Name/TypeAnnotation) 파싱 확인용",
				},
			},
			methods = {
				{
					name = "BuildReport",
					description = [[
						입력값을 기반으로 보고서를 생성합니다.\z
						여러 줄 설명과 파라미터/반환/에러를 함께 테스트합니다.\z
					]],
					params = {
						{
							name = "source",
							type = "string",
							description = [[
								입력 경로입니다.\z
								상대/절대 경로 모두 허용됩니다.\z
							]],
						},
						{
							name = "limit",
							type = "number",
							description = "최대 처리 수",
							default = "100",
						},
						"boolean",
					},
					returns = {
						{ type = "boolean", description = "생성 성공 여부" },
						{
							type = "string",
							description = [[
								생성된 보고서 파일 경로입니다.\z
								실패 시 빈 문자열을 반환합니다.\z
							]],
						},
					},
					errors = {
						{ type = "string", description = "입력 유효성 검증 실패" },
					},
					yields = true,
				},
				{
					name = "CreateFromRaw",
					isStatic = true,
					description = "정적 생성 메서드 테스트입니다.",
					params = {
						{ name = "payload", type = "{ [string]: any }" },
					},
					returns = {
						{ type = "DocgenMultiLine" },
					},
				},
			},
			events = {
				{
					name = "ReportReady",
					description = "보고서 생성 완료 이벤트입니다.",
					params = {
						{ name = "ok", type = "boolean", description = "성공 여부" },
						{ name = "path", type = "string", description = "파일 경로" },
					},
					returns = {
						{ type = "number", description = "소요 시간(ms)" },
					},
				},
			},
			interfaces = {
				{
					name = "ReportConfig",
					description = "fields 대신 props 키로도 인터페이스 필드를 전달합니다.",
					props = {
						{ name = "title", type = "string", description = "제목" },
						{ name = "verbose", type = "boolean", description = "상세 출력 여부" },
					},
				},
			},
			types = {
				{
					name = "ReportState",
					type = '"Idle" | "Running" | "Done"',
					description = "리포트 상태 타입입니다.",
				},
				{
					Name = "ReportKey",
					TypeAnnotation = 'string & { __brand: "ReportKey" }',
					Description = "브랜드 타입 테스트입니다.",
				},
			},
			groups = {
				["기타"] = {
					methods = {
						{
							name = "DumpLines",
							description = "개행 포함 문자열을 반환합니다.",
							returns = {
								{ type = "string" },
							},
						},
					},
					types = {
						{
							name = "DumpMode",
							type = '"Flat" | "Pretty"',
						},
					},
				},
				["세부"] = {
					props = {
						{
							name = "DetailLevel",
							type = "number",
							description = "세부 출력 레벨",
						},
					},
					events = {
						{
							name = "DetailChanged",
							params = {
								{ name = "level", type = "number" },
							},
						},
					},
					interfaces = {
						{
							name = "DetailOptions",
							fields = {
								{ name = "compact", type = "boolean" },
							},
						},
					},
				},
			},
		},
		{
			name = "DocgenCrossWithin",
			category = "Showcase/Advanced",
			description = "within 재지정으로 다른 클래스에 멤버를 붙이는 테스트입니다.",
			types = {
				{
					name = "ExternalAlias",
					type = "DocgenMembers",
					within = "DocgenMembers",
					description = "다른 클래스에 타입을 주입합니다.",
				},
				{
					name = "AdvancedScriptAlias",
					type = "{ source: \"docgen-script\" }",
					within = "AdvancedTypes",
					description = "기존 AdvancedTypes 페이지에 타입을 주입합니다.",
				},
			},
			methods = {
				{
					name = "ForwardResolve",
					within = "DocgenMembers",
					description = "다른 클래스에 메서드를 주입합니다.",
					params = {
						{ name = "token", type = "string" },
					},
					returns = {
						{ type = "boolean" },
					},
					errors = {
						{ type = "string", description = "권한 오류" },
					},
				},
				{
					name = "BuildFromScript",
					within = "AdvancedTypes",
					description = "기존 AdvancedTypes 페이지에 메서드를 주입합니다.",
					params = {
						{ name = "id", type = "string" },
					},
					returns = {
						{ type = "boolean", description = "생성 성공 여부" },
					},
				},
			},
		},
	},
}
