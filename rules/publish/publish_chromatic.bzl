"""
Simple rule which is responsible for tracking :build dependencies.s
"""

load("@com_cognitedata_bazel_snapshots//snapshots:snapshots.bzl", "create_tracker_file")

def _publish_chromatic(ctx):
    out_file = ctx.actions.declare_file(ctx.label.name + ".bash")

    substitutions = {
        "@@STORYBOOK_FOLDER@@": ctx.file.storybook_folder.short_path,
        "@@CHROMATIC_SCRIPT@@": ctx.file._chromatic.short_path,
        "@@PROJECT_NAME@@": ctx.attr.project_name,
    }
    ctx.actions.expand_template(
        template = ctx.file._runner,
        output = out_file,
        substitutions = substitutions,
        is_executable = True,
    )
    runfiles = ctx.runfiles(
        files = [ctx.file.storybook_folder, ctx.file._chromatic] + ctx.files.deps,
    )
    tracked_files = ctx.files.deps
    tracker_file = create_tracker_file(
        ctx,
        tracked_files,
        run = [ctx.label],
        tags = ["publish_chromatic"],
    )
    return [DefaultInfo(
        files = depset([out_file]),
        runfiles = runfiles,
        executable = out_file,
    ), tracker_file]

publish_chromatic = rule(
    implementation = _publish_chromatic,
    attrs = {
        "project_name": attr.string(
            mandatory = True,
            doc = "Name must match secret key created in infrastructure repo",
        ),
        "storybook_folder": attr.label(
            allow_single_file = True,
        ),
        "deps": attr.label_list(
            allow_files = True,
        ),
        "_chromatic": attr.label(
            default = "@npm//:node_modules/chromatic/bin/main.cjs",
            cfg = "exec",
            executable = True,
            allow_single_file = True,
        ),
        "_runner": attr.label(
            default = "//rules/publish:publish_chromatic.template.bash",
            cfg = "exec",
            executable = True,
            allow_single_file = True,
        ),
        "_snapshots": attr.label(
            default = "@snapshots-bin//:snapshots",
            cfg = "exec",
            executable = True,
            allow_single_file = True,
        ),
    },
    executable = True,
)
