"""append_deps wrapper for generating dependencies for package.json"""

def _build_sed_impl(ctx):
    out_file = ctx.actions.declare_directory(ctx.attr.out_dir)

    ctx.actions.run(
        inputs = ctx.files.src_dir,
        outputs = [out_file],
        arguments = [ctx.files.src_dir[0].path, out_file.path, ctx.attr.app],
        executable = ctx.executable.binary,
        execution_requirements = {
            "no-cache": "1",
        },
    )

    return DefaultInfo(files = depset([out_file]))

build_sed = rule(
    implementation = _build_sed_impl,
    attrs = {
        "src_dir": attr.label(
            allow_files = True,
            doc = "source directory",
        ),
        "app": attr.string(
            doc = "application name",
        ),
        "out_dir": attr.string(
            doc = "directory name",
        ),
        "binary": attr.label(
            executable = True,
            cfg = "exec",
        ),
    },
)
