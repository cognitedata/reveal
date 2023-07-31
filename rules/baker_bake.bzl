"""
Simple rule which is responsible for tracking .baker manifest templates updates
and for printing out json needed for further verification by Jenkins
"""

def _baker_bake(ctx):
    out_file = ctx.actions.declare_file(ctx.label.name + ".bash")

    substitutions = {
        "@@SERVICE_NAME@@": ctx.attr.service_name,
    }
    ctx.actions.expand_template(
        template = ctx.file._runner,
        output = out_file,
        substitutions = substitutions,
        is_executable = True,
    )
    runfiles = ctx.runfiles(
        files = [],
    )
    return [DefaultInfo(
        files = depset([out_file]),
        runfiles = runfiles,
        executable = out_file,
    )]

baker_bake = rule(
    implementation = _baker_bake,
    attrs = {
        "service_name": attr.string(
            doc = "Service name",
        ),
        "manifests": attr.label_list(
            doc = "Templates to generate .baker manifests",
            allow_files = True,
            mandatory = True,
        ),
        "_runner": attr.label(
            default = "//rules:baker_bake.template.bash",
            allow_single_file = True,
        ),
    },
    executable = True,
)
