"""
Test rules
"""

load("@npm//testcafe:index.bzl", _testcafe = "testcafe")
load("@bazel_skylib//rules:write_file.bzl", "write_file")

def testcafe_test(name, app_name, data, args = [], timeout = "long", **kwargs):
    """Creates a testcafe test wrapper

    Args:
        name: name of the target
        app_name: folder name to store artifacts during CI run
        data: source files (tests and non-test files)
        args: extra arguments to pass
        timeout: How long the test is expected to run before returning.
        **kwargs: rest of arguments passed to testcafe
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
        name = "%s_base" % name,
        data = [
            "@npm//@ffmpeg-installer/ffmpeg",
            "@npm//kill-port",
            "@npm//serve",
        ] + data,
        **kwargs
    )

    native.sh_test(
        name = name,
        srcs = ["//rules/test:testcafe_test.sh"],
        args = [app_name] + ["$(rootpath :%s_base)" % name] + [
            "--node_options=--require=./$(rootpath %s)" % file_name,
        ] + args,
        data = [
            file_name,
            ":%s_base" % name,
        ],
        timeout = timeout,
    )
