"""Build to execute the generator binary."""

def _get_releases_impl(ctx):
    datafile = ctx.actions.declare_file("releases.txt")
    args = ctx.actions.args()

    args.add("1.3.0-rc.4")  # Version Spec
    args.add(ctx.attr.app_id)  # App ID
    args.add(ctx.file.configMap.path)  # Config Map
    args.add(datafile.path)  # Target File

    ctx.actions.run(
        outputs = [datafile],
        arguments = [args],
        inputs = depset([
            ctx.file.configMap,
        ]),
        executable = ctx.executable.binary,
        use_default_shell_env = True,
    )

    runfiles = ctx.runfiles(files = [datafile])

    return [DefaultInfo(
        files = depset([datafile]),
    )]

get_releases = rule(
    implementation = _get_releases_impl,
    attrs = {
        "binary": attr.label(
            executable = True,
            cfg = "exec",
            allow_files = True,
        ),
        "configMap": attr.label(allow_single_file = True),
        "app_id": attr.string(
            doc = "FAS app id (staging or production)",
            mandatory = True,
        ),
    },
)
