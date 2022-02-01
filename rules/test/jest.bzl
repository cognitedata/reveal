"""Jest rules."""

load("@bazel_skylib//rules:write_file.bzl", "write_file")
load("@build_bazel_rules_nodejs//:providers.bzl", "DeclarationInfo", "JSModuleInfo")
load("@npm//jest-cli:index.bzl", _jest_cli = "jest")

def _jest_deps_impl(ctx):
    declarations = []
    files = []

    internal_deps = [dep for dep in ctx.attr.deps if not dep.label.workspace_name]
    for dep in internal_deps:
        if dep[DeclarationInfo]:
            declarations.append(dep[DeclarationInfo].declarations)
            declarations.append(dep[DeclarationInfo].transitive_declarations)
        if dep[JSModuleInfo]:
            files.append(dep[JSModuleInfo].sources)
        files.append(dep[DefaultInfo].files)

    return [
        DefaultInfo(files = depset(transitive = files + declarations)),
        DeclarationInfo(transitive_declarations = depset(transitive = declarations)),
    ]

_jest_deps = rule(
    implementation = _jest_deps_impl,
    attrs = {
        "deps": attr.label_list(
            allow_files = True,
        ),
    },
)

def _jest_test(name, service_name, srcs, deps, jest_config, jest_args = [], **kwargs):
    chdir_name = "_chdir_%s" % name
    file_name = chdir_name + ".js"
    write_file(
        name = chdir_name,
        out = file_name,
        content = ["process.chdir(__dirname)"],
        visibility = ["//visibility:public"],
    )

    templated_args = [
        # ibazel is the watch mode for Bazel when running tests
        # Because Bazel is really a CI system that runs locally
        "--watchAll=false",
        "--no-cache",
        "--no-watchman",
        "--ci",
        "--colors",
        "--coverage",
        "--forceExit",
        "--passWithNoTests",
        "--verbose",
        "--reporters=default",
        "--reporters=jest-junit",
        "--runInBand",
        "--detectOpenHandles",
    ] + jest_args

    templated_args.extend(["--config", jest_config])
    for src in srcs:
        templated_args.extend(["--runTestsByPath", "%s" % src])

    templated_args.extend(["--node_options=--preserve-symlinks", "--node_options=--require=./$(rootpath %s)" % file_name])

    data = [jest_config] + srcs + deps + [
        "//rules/test:jest-reporter.js",
        "@npm//@testing-library/jest-dom",
        "@npm//@types/jest",
        "@npm//@types/node",
        "@npm//jest-junit",
        "@npm//jest-localstorage-mock",
        "@npm//jest-css-modules-transform",
        "@npm//jest-environment-jsdom",
        "@npm//jest-transform-stub",
        "@npm//ts-jest",
        file_name,
    ]

    base_name = service_name + "jest_base"
    _jest_cli(
        name = base_name,
        data = data,
        templated_args = templated_args,
    )

    native.sh_test(
        name = name,
        srcs = ["//rules/test:jest.sh"],
        args = [service_name] + ["$(rootpath :%s)" % base_name] + [
            "--node_options=--require=./$(rootpath %s)" % file_name,
        ],
        data = [
            file_name,
            base_name,
        ],
        **kwargs
    )

def jest_test(name, service_name, srcs, deps, jest_config, jest_args = [], **kwargs):
    """Creates a Jest test.

    Usage:
        bazel test //:my_jest_test [--test_output=all]
    Args:
        name: name of the target
        service_name: service name directory name to save codecov
        srcs: source files (tests and non-test files)
        deps: dependencies
        jest_args: extra arguments to Jest
        jest_config: jest config files
        **kwargs: rest of arguments passed to jest
    """
    jest_deps = "%s.deps" % name
    _jest_deps(
        name = jest_deps,
        deps = deps,
    )

    _jest_test(
        name = name,
        service_name = service_name,
        srcs = srcs,
        deps = [jest_deps],
        jest_config = jest_config,
        jest_args = jest_args,
        **kwargs
    )
