"""
Simple rule which is responsible for tracking storybook dependencies.

"""

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
    return [DefaultInfo(
        files = depset([out_file]),
        runfiles = runfiles,
        executable = out_file,
    )]

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
    },
    executable = True,
)
