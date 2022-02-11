"""
Test rules
"""

load("@npm//react-scripts:index.bzl", _react_scripts = "react_scripts")
load("@bazel_skylib//rules:write_file.bzl", "write_file")

def react_scripts_test(name, app_name, data, timeout = "long", args = [], tags = []):
    """Creates a react-scripts test wrapper

    Args:
        name: name of the target
        app_name: name of the target
        data: source files (tests and non-test files)
        timeout: How long the test is expected to run before returning.
        args: extra arguments to pass
        tags: list of tags to give to the targets
    """
    chdir_name = "_chdir_%s" % name
    file_name = chdir_name + ".js"
    write_file(
        name = chdir_name,
        out = file_name,
        content = ["process.chdir(__dirname)"],
        visibility = ["//visibility:public"],
    )

    _react_scripts(
        name = "%s_base" % name,
        data = [
            "@npm//jest-environment-jsdom",
            "@npm//jest-junit",
        ] + data,
    )

    native.sh_test(
        name = name,
        srcs = ["//rules/test:react_scripts_test.sh"],
        args = [app_name] + ["$(rootpath :%s_base)" % name] + [
            "--node_options=--require=./$(rootpath %s)" % file_name,
            "test",
            # ibazel is the watch mode for Bazel when running tests
            # Because Bazel is really a CI system that runs locally
            "--watchAll=false",
            "--no-cache",
            "--no-watchman",
            "--ci",
            "--coverage",
            "--collectCoverageFrom='!*/**/*.stories.tsx'",
            "--verbose",
            "--reporters=default",
            "--reporters=jest-junit",
            "--runInBand",
            "--detectOpenHandles",
            "--env=jest-environment-jsdom",
        ] + args,
        data = [
            file_name,
            ":%s_base" % name,
        ],
        # Need to set the pwd to avoid jest needing a runfiles helper
        # Windows users with permissions can use --enable_runfiles
        # to make this test work
        tags = tags + ["no-bazelci-windows"],
        timeout = timeout,
    )
