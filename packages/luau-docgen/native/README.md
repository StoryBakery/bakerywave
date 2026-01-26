# luau-docgen native (Rust + C++)

이 디렉터리는 Rust CLI와 Luau C++ 코어를 함께 빌드합니다.

## 공통 전제

- Rust 툴체인 설치
- CMake 설치

Luau 소스는 기본적으로 `luau.version`에 고정된 커밋을 FetchContent로 가져옵니다.

다른 소스를 쓰려면 아래 환경 변수를 사용합니다.

- `LUAU_DOCGEN_LUAU_DIR`: Luau 소스 경로
- `LUAU_DOCGEN_LUAU_TAG`: Luau git tag/commit

## Windows (권장: MSVC)

MSVC 툴체인은 Visual C++ Build Tools(= link.exe 포함)가 필요합니다.

```
cd packages/luau-docgen/native
cargo build --release
```

## Windows (대안: GNU)

MSVC가 없으면 GNU 툴체인을 사용합니다. 아래는 MSYS2 UCRT64 기준입니다.

```
set PATH=C:\Users\<user>\.cargo\bin;C:\msys64\ucrt64\bin;%PATH%
rustup toolchain install stable-x86_64-pc-windows-gnu
set "CMAKE_GENERATOR=Ninja"
set "CMAKE_C_COMPILER=C:\msys64\ucrt64\bin\gcc.exe"
set "CMAKE_CXX_COMPILER=C:\msys64\ucrt64\bin\g++.exe"
set "CMAKE_MAKE_PROGRAM=C:\msys64\ucrt64\bin\ninja.exe"
cd /d C:\path\to\repo\packages\luau-docgen\native
cargo +stable-x86_64-pc-windows-gnu build --release
```

## Linux/macOS

기본 툴체인으로 빌드합니다.

```
cd packages/luau-docgen/native
cargo build --release
```

## native/bin 복사 (옵션)

빌드된 바이너리를 `native/bin`으로 복사해 경로를 단순화합니다.

```
cd packages/luau-docgen
npm run native:bin
```

## 실행

빌드 산출물은 아래 중 하나에 생성됩니다.

- `native/target/release/luau-docgen` (기본)
- `native/target/<triple>/release/luau-docgen` (GNU 등 타겟 지정 시)

Node 래퍼는 위 경로를 자동 탐색합니다.

```
luau-docgen --root <repo> --src src --out reference.json
```
