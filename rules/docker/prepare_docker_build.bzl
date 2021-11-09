"""Build to execute the generator binary."""

def _prepare_docker_build_impl(ctx):
    datafile = ctx.actions.declare_directory(ctx.attr.out_dir)
    args = ctx.actions.args()
    args.add(datafile.path)
    args.add(ctx.file.getRelease.path)
    args.add(ctx.file.configMap.path)

    ctx.actions.run(
        outputs = [datafile],
        arguments = [args],
        inputs = depset([
            ctx.file.getRelease,
            ctx.file.configMap,
            ctx.file.googleCredentials,
        ]),
        executable = ctx.executable.binary,
        env = {
            "GOOGLE_APPLICATION_CREDENTIALS": ctx.file.googleCredentials.path,
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
        "configMap": attr.label(allow_single_file = True),
        "getRelease": attr.label(allow_single_file = True),
        "googleCredentials": attr.label(allow_single_file = True),
    },
)
