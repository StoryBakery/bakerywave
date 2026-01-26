cmake_minimum_required(VERSION 3.20)

project(luau-docgen-native LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

set(LUAU_DOCGEN_LUAU_DIR "" CACHE PATH "Path to Luau source")

set(LUAU_DOCGEN_LUAU_VERSION_FILE "${CMAKE_CURRENT_LIST_DIR}/../luau.version")
set(LUAU_DOCGEN_LUAU_TAG "" CACHE STRING "Luau git tag or commit")
if(NOT LUAU_DOCGEN_LUAU_TAG)
  if(EXISTS "${LUAU_DOCGEN_LUAU_VERSION_FILE}")
    file(READ "${LUAU_DOCGEN_LUAU_VERSION_FILE}" LUAU_DOCGEN_LUAU_TAG)
    string(STRIP "${LUAU_DOCGEN_LUAU_TAG}" LUAU_DOCGEN_LUAU_TAG)
  else()
    set(LUAU_DOCGEN_LUAU_TAG "master")
  endif()
endif()

if(LUAU_DOCGEN_LUAU_DIR)
  add_subdirectory(${LUAU_DOCGEN_LUAU_DIR} ${CMAKE_BINARY_DIR}/luau)
else()
  include(FetchContent)
  FetchContent_Declare(
    luau
    GIT_REPOSITORY https://github.com/luau-lang/luau.git
    GIT_TAG ${LUAU_DOCGEN_LUAU_TAG}
  )
  FetchContent_MakeAvailable(luau)
endif()

add_library(luau-docgen-core STATIC
  src/docgen.cpp
)

target_include_directories(luau-docgen-core PUBLIC
  ${CMAKE_CURRENT_LIST_DIR}/include
)

# Luau 공식 엔진(Analysis/Frontend)까지 직접 링크한다.
# 정적 링크 환경에서 의존 라이브러리를 누락하지 않도록 명시적으로 나열한다.
target_link_libraries(luau-docgen-core PRIVATE
  Luau.Analysis
  Luau.Compiler
  Luau.VM
  Luau.Ast
  Luau.Common
  Luau.Config
)

install(TARGETS
  luau-docgen-core
  Luau.Analysis
  Luau.Compiler
  Luau.VM
  Luau.Ast
  Luau.Common
  Luau.Config
  ARCHIVE DESTINATION lib
)
