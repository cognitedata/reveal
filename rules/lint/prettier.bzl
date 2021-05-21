"""Prettier rules."""

load("@npm//prettier:index.bzl", _prettier_test = "prettier_test")

def prettier_test(name, data, prettier_config, **kwargs):
    """Runs prettier as a test on a set of sources.

    Examples:
        # Runs Prettier tests
        bazel test //my-pkg:prettier_test

        # Writes suggestions from Prettier
        bazel run //my-pkg:prettier_test -- --write

    Args:
      name: name of this target
      data: the sources to run Prettier on
      prettier_config: the prettier_config to use
      **kwargs: rest of arguments passed to prettier
    """
    default_args = [
        "-l",
        "**/*.ts",
        "--config",
        "$(rootpath %s)" % prettier_config,
    ]
    templated_args = kwargs.pop("templated_args", default_args)

    if len(data) == 0:
        fail("Must list sources in data attribute")

    inputs = []
    inputs.extend(data)
    inputs.extend([prettier_config])

    _prettier_test(
        name = name,
        data = inputs,
        templated_args = templated_args,
        **kwargs
    )

def _prettier_config_impl(ctx):
    transitive = []
    for dep in ctx.attr.deps:
        if DefaultInfo in dep:
            for file in dep[DefaultInfo].files.to_list():
                transitive.append(file)
            for file in dep[DefaultInfo].data_runfiles.files.to_list():
                transitive.append(file)
    files = depset([ctx.file.src])

    return [
        DefaultInfo(files = files, runfiles = ctx.runfiles(transitive)),
    ]

prettier_config = rule(
    implementation = _prettier_config_impl,
    attrs = {
        "deps": attr.label_list(
            doc = "Additional .prettierrc files referenced",
            allow_files = True,
        ),
        "src": attr.label(
            doc = "The .prettierrc file passed to Prettier",
            allow_single_file = True,
            mandatory = True,
        ),
    },
)
