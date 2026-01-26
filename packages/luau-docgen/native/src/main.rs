use std::env;
use std::ffi::CString;
use std::os::raw::c_char;

#[repr(C)]
struct LuauDocgenOptions {
    root_dir: *const c_char,
    src_dir: *const c_char,
    types_dir: *const c_char,
    out_path: *const c_char,
    generator_version: *const c_char,
    fail_on_warning: i32,
}

extern "C" {
    fn luau_docgen_run(options: *const LuauDocgenOptions) -> i32;
}

#[derive(Default)]
struct Args {
    root_dir: Option<String>,
    src_dir: Option<String>,
    types_dir: Option<String>,
    out_path: Option<String>,
    generator_version: Option<String>,
    fail_on_warning: bool,
    help: bool,
}

fn print_help() {
    println!("luau-docgen");
    println!("\nUsage:");
    println!("  luau-docgen --out <path> [--root <dir>] [--src <dir>] [--types <dir>]");
    println!("\nOptions:");
    println!("  --root <dir>             Root directory (default: cwd)");
    println!("  --src <dir>              Source directory (default: <root>/src)");
    println!("  --types <dir>            Optional types directory");
    println!("  --out <path>             Output JSON path (default: reference.json)");
    println!("  --generator-version <v>  Generator version string");
    println!("  --fail-on-warning        Exit with non-zero when warnings exist");
}

fn parse_args() -> Result<Args, String> {
    let mut args = Args::default();
    let mut iter = env::args().skip(1).peekable();

    while let Some(arg) = iter.next() {
        match arg.as_str() {
            "--root" => {
                let value = iter.next().ok_or("--root requires a value")?;
                args.root_dir = Some(value);
            }
            "--src" => {
                let value = iter.next().ok_or("--src requires a value")?;
                args.src_dir = Some(value);
            }
            "--types" => {
                let value = iter.next().ok_or("--types requires a value")?;
                args.types_dir = Some(value);
            }
            "--out" => {
                let value = iter.next().ok_or("--out requires a value")?;
                args.out_path = Some(value);
            }
            "--generator-version" => {
                let value = iter.next().ok_or("--generator-version requires a value")?;
                args.generator_version = Some(value);
            }
            "--fail-on-warning" => {
                args.fail_on_warning = true;
            }
            "-h" | "--help" => {
                args.help = true;
            }
            _ => {
                return Err(format!("Unknown argument: {}", arg));
            }
        }
    }

    Ok(args)
}

fn to_cstring(value: Option<String>) -> Option<CString> {
    value.map(|item| CString::new(item).unwrap())
}

fn main() {
    let parsed = match parse_args() {
        Ok(args) => args,
        Err(message) => {
            eprintln!("[luau-docgen] {}", message);
            print_help();
            std::process::exit(1);
        }
    };

    if parsed.help {
        print_help();
        return;
    }

    let root_dir = to_cstring(parsed.root_dir);
    let src_dir = to_cstring(parsed.src_dir);
    let types_dir = to_cstring(parsed.types_dir);
    let out_path = to_cstring(parsed.out_path);
    let generator_version = to_cstring(
        parsed
            .generator_version
            .or_else(|| Some(env!("CARGO_PKG_VERSION").to_string())),
    );

    let options = LuauDocgenOptions {
        root_dir: root_dir.as_ref().map_or(std::ptr::null(), |value| value.as_ptr()),
        src_dir: src_dir.as_ref().map_or(std::ptr::null(), |value| value.as_ptr()),
        types_dir: types_dir.as_ref().map_or(std::ptr::null(), |value| value.as_ptr()),
        out_path: out_path.as_ref().map_or(std::ptr::null(), |value| value.as_ptr()),
        generator_version: generator_version
            .as_ref()
            .map_or(std::ptr::null(), |value| value.as_ptr()),
        fail_on_warning: if parsed.fail_on_warning { 1 } else { 0 },
    };

    let exit_code = unsafe { luau_docgen_run(&options) };
    if exit_code != 0 {
        std::process::exit(exit_code);
    }
}
