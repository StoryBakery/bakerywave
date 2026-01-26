#ifndef LUAU_DOCGEN_H
#define LUAU_DOCGEN_H

#ifdef __cplusplus
extern "C" {
#endif

struct LuauDocgenOptions
{
    const char* root_dir;
    const char* src_dir;
    const char* types_dir;
    const char* out_path;
    const char* generator_version;
    int fail_on_warning;
};

int luau_docgen_run(const LuauDocgenOptions* options);

#ifdef __cplusplus
}
#endif

#endif
