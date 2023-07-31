"""Build to execute the generator binary."""

def _prepare_docker_build_impl(ctx):
    datafile = ctx.actions.declare_directory(ctx.attr.out_dir)
    args = ctx.actions.args()
    args.add(datafile.path)
    args.add(ctx.file.get_release.path)
    args.add(ctx.file.config_map.path)

    ctx.actions.run(
        outputs = [datafile],
        arguments = [args],
        inputs = depset([
            ctx.file.get_release,
            ctx.file.config_map,
            ctx.file.google_credentials,
        ]),
        executable = ctx.executable.binary,
        env = {
            "GOOGLE_APPLICATION_CREDENTIALS": ctx.file.google_credentials.path,
        },
    )

    runfiles = ctx.runfiles(files = [datafile])

    return [
        DefaultInfo(
            files = depset([datafile]),
            runfiles = runfiles,
        ),
    ]

prepare_docker_build = rule(
    implementation = _prepare_docker_build_impl,
    attrs = {
        "binary": attr.label(
            executable = True,
            cfg = "exec",
            allow_files = True,
        ),
        "out_dir": attr.string(
            doc = "Path to out folder",
            mandatory = True,
        ),
        "config_map": attr.label(allow_single_file = True),
        "get_release": attr.label(allow_single_file = True),
        "google_credentials": attr.label(allow_single_file = True),
    },
)
