"""Rules for generating deps helpers."""

load("@bazel_skylib//lib:shell.bzl", "shell")

def _generate_helpers_impl(ctx):
    out_file = ctx.actions.declare_file(ctx.label.name + ".bash")

    substitutions = {
        "@@OUTFILE_SHORT_PATH": shell.quote(out_file.short_path),
        "@@BUILDIFIER_SHORT_PATH@@": shell.quote(ctx.executable._buildifier.short_path),
        "@@GENERATOR_SHORT_PATH@@": shell.quote(ctx.executable._generator.short_path),
        "@@WORKSPACE_NAME@@": ctx.workspace_name,
        "@@PACKAGE_PATH@@": ctx.file.package_json.path,
        "@@SRC_PATH@@": "%s/%s" % (ctx.label.package, ctx.attr.src_dir),
        "@@OUT_PATH@@": ctx.attr.out_dir,
        "@@WORKSPACE@@": ctx.attr.workspace,
        "@@BUILD_FILE@@": ctx.build_file_path,
    }
    ctx.actions.expand_template(
        template = ctx.file._runner,
        output = out_file,
        substitutions = substitutions,
        is_executable = True,
    )
    runfiles = ctx.runfiles(
        files = [
                    ctx.executable._buildifier,
                    ctx.executable._generator,
                ] + ctx.attr._buildifier[DefaultInfo].default_runfiles.files.to_list() +
                ctx.attr._generator[DefaultInfo].default_runfiles.files.to_list(),
    )
    return [DefaultInfo(
        files = depset([out_file]),
        runfiles = runfiles,
        executable = out_file,
    )]

generate_package_json_helpers = rule(
    implementation = _generate_helpers_impl,
    attrs = {
        "package_json": attr.label(
            doc = "The package.json to generate for",
            allow_single_file = True,
            mandatory = True,
        ),
        "out_dir": attr.string(
            doc = "Path to out folder",
            mandatory = True,
        ),
        "src_dir": attr.string(
            doc = "Path to the source folder",
            mandatory = True,
        ),
        "workspace": attr.string(
            doc = "The node_modules workspace to use, e.g. @npm",
            mandatory = True,
        ),
        "_buildifier": attr.label(
            default = "@com_github_cognitedata_bazel_tools//bazel/buildifier:buildifier",
            cfg = "target",
            executable = True,
        ),
        "_generator": attr.label(
            default = "//rules/package_json_helpers:generate",
            cfg = "target",
            executable = True,
        ),
        "_runner": attr.label(
            default = "//rules/package_json_helpers:runner.template.bash",
            allow_single_file = True,
        ),
    },
    executable = True,
)
