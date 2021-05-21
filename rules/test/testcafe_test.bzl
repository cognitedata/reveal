"""
Test rules
"""

load("@npm//testcafe:index.bzl", _testcafe = "testcafe")
load("@bazel_skylib//rules:write_file.bzl", "write_file")

def testcafe_test(name, app_name, data, args = [], env = {}):
    """Creates a react-scripts test wrapper

    Args:
        name: name of the target
        app_name: name of the target
        data: source files (tests and non-test files)
        args: extra arguments to pass
        env: env vars
    """
    chdir_name = "_chdir_%s" % name
    file_name = chdir_name + ".js"
    write_file(
        name = chdir_name,
        out = file_name,
        content = ["process.chdir(__dirname)"],
        visibility = ["//visibility:public"],
    )

    _testcafe(
        name = "testcafe_test_base",
        data = [
            "@npm//@ffmpeg-installer/ffmpeg",
        ] + data,
        env = env,
    )

    native.sh_test(
        name = name,
        srcs = ["//rules/test:testcafe_test.sh"],
        args = [app_name] + ["$(rootpath :testcafe_test_base)"] + [
            "--node_options=--require=./$(rootpath %s)" % file_name,
        ] + args,
        data = [
            file_name,
            ":testcafe_test_base",
        ],
    )
