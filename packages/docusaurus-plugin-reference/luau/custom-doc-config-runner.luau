local function getArgs()
    local ok, process = pcall(require, "@lune/process")
    if ok and process and type(process.args) == "table" then
        local args = process.args
        if #args > 0 and args[1] == "--" then
            local sliced = {}
            for index = 2, #args do
                table.insert(sliced, args[index])
            end
            return sliced
        end
        return args
    end

    if type(_G) == "table" and type(_G.arg) == "table" then
        return _G.arg
    end

    return {}
end

local function jsonEscape(value)
    return (value:gsub("[\\\"\b\f\n\r\t]", {
        ["\\"] = "\\\\",
        ["\""] = "\\\"",
        ["\b"] = "\\b",
        ["\f"] = "\\f",
        ["\n"] = "\\n",
        ["\r"] = "\\r",
        ["\t"] = "\\t",
    }))
end

local function isArray(tbl)
    local maxIndex = 0
    local count = 0
    for key, _ in pairs(tbl) do
        if type(key) ~= "number" or key < 1 or key % 1 ~= 0 then
            return false
        end
        if key > maxIndex then
            maxIndex = key
        end
        count += 1
    end
    return maxIndex == count
end

local function encodeJson(value)
    local valueType = type(value)
    if valueType == "nil" then
        return "null"
    elseif valueType == "boolean" then
        return value and "true" or "false"
    elseif valueType == "number" then
        if value ~= value or value == math.huge or value == -math.huge then
            return "null"
        end
        return tostring(value)
    elseif valueType == "string" then
        return "\"" .. jsonEscape(value) .. "\""
    elseif valueType == "table" then
        if isArray(value) then
            local items = {}
            for index = 1, #value do
                items[index] = encodeJson(value[index])
            end
            return "[" .. table.concat(items, ",") .. "]"
        else
            local items = {}
            for key, entry in pairs(value) do
                if type(key) == "string" then
                    table.insert(items, encodeJson(key) .. ":" .. encodeJson(entry))
                end
            end
            table.sort(items)
            return "{" .. table.concat(items, ",") .. "}"
        end
    end

    return "null"
end

local function stripExtension(path)
    if path:sub(-5) == ".luau" then
        return path:sub(1, -6)
    end
    if path:sub(-4) == ".lua" then
        return path:sub(1, -5)
    end
    return path
end

local function tryRequire(path)
    local ok, result = pcall(require, path)
    if ok then
        return true, result
    end
    return false, result
end

local function tryLoadFile(path)
    local ok, loader = pcall(loadfile, path)
    if ok and type(loader) == "function" then
        local ok2, result = pcall(loader)
        if ok2 then
            return true, result
        end
        return false, result
    end
    return false, loader
end

local args = getArgs()
local target = args[#args]
if not target or target == "" then
    error("custom doc config path missing")
end

local candidates = {
    target,
    "./" .. target,
    stripExtension(target),
    "./" .. stripExtension(target),
}

local config = nil

for _, candidate in ipairs(candidates) do
    local ok, result = tryRequire(candidate)
    if ok then
        config = result
        break
    end
end

if not config then
    for _, candidate in ipairs(candidates) do
        local ok, result = tryLoadFile(candidate)
        if ok then
            config = result
            break
        end
    end
end

if type(config) ~= "table" then
    error("custom doc config did not return a table")
end

print(encodeJson(config))
