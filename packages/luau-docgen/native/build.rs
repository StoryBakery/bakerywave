use std::env;

fn main() {
    let mut cfg = cmake::Config::new("cpp");

    let profile = env::var("PROFILE").unwrap_or_else(|_| "release".to_string());
    cfg.profile(&profile);

    if let Ok(dir) = env::var("LUAU_DOCGEN_LUAU_DIR") {
        if !dir.is_empty() {
            cfg.define("LUAU_DOCGEN_LUAU_DIR", dir);
        }
    }

    if let Ok(tag) = env::var("LUAU_DOCGEN_LUAU_TAG") {
        if !tag.is_empty() {
            cfg.define("LUAU_DOCGEN_LUAU_TAG", tag);
        }
    }

    let dst = cfg.build();

    println!("cargo:rustc-link-search=native={}/lib", dst.display());

    // luau-docgen-core가 Luau 정적 라이브러리에 의존하므로,
    // 정적 링크 순서를 의존 관계(상위 -> 하위) 기준으로 고정한다.
    println!("cargo:rustc-link-lib=static=luau-docgen-core");
    println!("cargo:rustc-link-lib=static=Luau.Analysis");
    println!("cargo:rustc-link-lib=static=Luau.Compiler");
    println!("cargo:rustc-link-lib=static=Luau.VM");
    println!("cargo:rustc-link-lib=static=Luau.Ast");
    println!("cargo:rustc-link-lib=static=Luau.Config");
    println!("cargo:rustc-link-lib=static=Luau.Common");

    if env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("windows") {
        println!("cargo:rustc-link-lib=stdc++");
    }
}
