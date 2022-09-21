"""
Simple rule which is responsible for tracking storybook dependencies.

"""

load("@com_cognitedata_bazel_snapshots//snapshots:snapshots.bzl", "create_tracker_file")

def _publish_storybook(ctx):
    out_file = ctx.actions.declare_file(ctx.label.name + ".bash")

    substitutions = {
        "@@SUB_DOMAIN@@": ctx.attr.sub_domain,
    }
    ctx.actions.expand_template(
        template = ctx.file._runner,
        output = out_file,
        substitutions = substitutions,
        is_executable = True,
    )
    runfiles = ctx.runfiles(
        files = ctx.files.build,
    )
    tracked_files = ctx.files.build
    tracker_file = create_tracker_file(
        ctx,
        tracked_files,
        run = [ctx.label],
        tags = ["publish_storybook"],
    )
    return [DefaultInfo(
        files = depset([out_file]),
        runfiles = runfiles,
        executable = out_file,
    ), tracker_file]

publish_storybook = rule(
    implementation = _publish_storybook,
    attrs = {
        "sub_domain": attr.string(
            doc = "Storybook sub domain to be used",
            mandatory = True,
        ),
        "build": attr.label(
            allow_files = True,
            doc = "Build",
            mandatory = True,
        ),
        "_runner": attr.label(
            default = "//rules/publish:publish_storybook.template.bash",
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
