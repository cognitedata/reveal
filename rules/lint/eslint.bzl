"""ESLint rules."""

load("@npm//eslint:index.bzl", _eslint_test = "eslint_test")

def eslint_test(name, data, eslint_config, **kwargs):
    """Runs ESLint as a test on data sources.

    Examples:
        # Runs ESLint test
        bazel test //my-pkg:eslint_test

        # Fixes ESLint errors
        bazel run //my-pkg:eslint_test -- --fix

    Args:
      name: name of the target
      data: sources to test
      eslint_config: the eslint_config to use, defaults to //:eslint_config
      **kwargs: rest of arguments passed to eslint_test
    """
    default_args = [
        "--max-warnings",
        "0",
        "--no-error-on-unmatched-pattern",
        "**/{src,dist,tests,lib}/**/*.{ts,tsx,js}",
        "--config",
        "$(rootpath %s)" % eslint_config,
    ]
    templated_args = kwargs.pop("templated_args", default_args)

    inputs = []
    inputs.extend(data)
    inputs.extend([eslint_config])

    deps = [
        # package.json is needed by eslint-plugin-import: https://github.com/import-js/eslint-plugin-import/issues/2096
        "//:package.json",
        "//packages/eslint-config",
        "//packages/eslint-plugin",
        "@npm//@testing-library/jest-dom",
        "@npm//@testing-library/react",
        "@npm//@typescript-eslint/eslint-plugin",
        "@npm//@typescript-eslint/parser",
        "@npm//eslint-config-airbnb",
        "@npm//eslint-config-prettier",
        "@npm//eslint-plugin-import",
        "@npm//eslint-plugin-jest",
        "@npm//eslint-plugin-jest-dom",
        "@npm//eslint-plugin-lodash",
        "@npm//eslint-plugin-prettier",
        "@npm//eslint-plugin-testing-library",
        "@npm//jest",
        "@npm//prettier",
    ]
    inputs.extend(deps)

    _eslint_test(
        name = name,
        data = inputs,
        templated_args = templated_args,
        **kwargs
    )

def _eslint_config_impl(ctx):
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

eslint_config = rule(
    implementation = _eslint_config_impl,
    attrs = {
        "deps": attr.label_list(
            doc = "Additional .eslintrc.js files referenced via require calls",
            allow_files = True,
        ),
        "src": attr.label(
            doc = "The .eslintrc.js file passed to ESLint",
            allow_single_file = True,
            mandatory = True,
        ),
    },
)
