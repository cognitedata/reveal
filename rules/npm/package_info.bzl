"""Checks if an NPM package needs to be published."""

def _package_info(ctx):
    out_file = ctx.actions.declare_file(ctx.label.name + ".bash")

    substitutions = {
        "@@NAME@@": ctx.attr.display_name,
        "@@TARGET@@": ctx.label.package,
    }
    ctx.actions.expand_template(
        template = ctx.file._runner,
        output = out_file,
        substitutions = substitutions,
        is_executable = True,
    )
    return [DefaultInfo(
        files = depset([out_file]),
        executable = out_file,
    )]

package_info = rule(
    implementation = _package_info,
    attrs = {
        "package": attr.label(
            doc = "The package to check if has been published",
            mandatory = True,
            allow_single_file = True,
        ),
        "display_name": attr.string(
            doc = "Name to display for printing",
        ),
        "_runner": attr.label(
            default = "//rules/npm:package_info.template.bash",
            allow_single_file = True,
        ),
    },
    executable = True,
)
