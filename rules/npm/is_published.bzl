"""Checks if an NPM package has already been pushed."""

load("@build_bazel_rules_nodejs//:providers.bzl", "LinkablePackageInfo")

def _is_published(ctx):
    out_file = ctx.actions.declare_file(ctx.label.name + ".bash")

    package_name = ctx.attr.package[LinkablePackageInfo].package_name

    substitutions = {
        "@@PACKAGE_PATH@@": ctx.file.package.short_path,
        "@@PACKAGE_NAME@@": package_name,
        "@@NODE_PATH@@": ctx.file._node.short_path,
        "@@NPM_PATH@@": ctx.file._npm.short_path,
    }
    ctx.actions.expand_template(
        template = ctx.file._runner,
        output = out_file,
        substitutions = substitutions,
        is_executable = True,
    )
    runfiles = ctx.runfiles(
        files = [
            ctx.file.package,
            ctx.file._node,
            ctx.file._npm,
        ],
    )
    return [DefaultInfo(
        files = depset([out_file]),
        runfiles = runfiles,
        executable = out_file,
    )]

is_published = rule(
    implementation = _is_published,
    attrs = {
        "package": attr.label(
            doc = "The package to check if has been published",
            mandatory = True,
            allow_single_file = True,
            providers = [LinkablePackageInfo],
        ),
        "_runner": attr.label(
            default = "//rules/npm:is_published.template.bash",
            allow_single_file = True,
        ),
        "_node": attr.label(
            default = Label("@nodejs//:node_bin"),
            allow_single_file = True,
        ),
        "_npm": attr.label(
            default = Label("@nodejs//:npm_bin"),
            allow_single_file = True,
        ),
    },
    executable = True,
)
