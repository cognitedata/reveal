"""Rules to handle storybook"""

def _move_assets_impl(ctx):
    out_file = ctx.actions.declare_directory(ctx.attr.out_dir)

    ctx.actions.run(
        inputs = ctx.files.src_dir,
        outputs = [out_file],
        arguments = [ctx.files.src_dir[0].path, out_file.path, ctx.attr.tmp_dir],
        executable = ctx.executable.binary,
    )

    return DefaultInfo(files = depset([out_file]))

_move_assets = rule(
    implementation = _move_assets_impl,
    attrs = {
        "src_dir": attr.label(
            allow_files = True,
            doc = "source directory",
        ),
        "out_dir": attr.string(
            doc = "directory name",
        ),
        "tmp_dir": attr.string(
            doc = "directory where assets are stored inside src_dir",
        ),
        "binary": attr.label(
            executable = True,
            cfg = "exec",
        ),
    },
)

def move_assets(name, src_dir, out_dir, tmp_dir):
    """Moves storybook generated files to be used properly

    Usage:
        bazel build //:my_move_assets
    Args:
        name: name of the target
        src_dir: source directory
        out_dir: directory target path
        tmp_dir: subdirectory of src_dir containing assets
    """
    binary_name = "%s-move-assets" % name
    native.sh_binary(
        name = binary_name,
        srcs = ["//rules/storybook:move_assets.sh"],
    )

    _move_assets(
        name = name,
        src_dir = src_dir,
        out_dir = out_dir,
        tmp_dir = tmp_dir,
        binary = ":%s" % binary_name,
    )
