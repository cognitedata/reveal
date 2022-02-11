"""
Test rules
"""

load("@npm//testcafe:index.bzl", _testcafe = "testcafe")
load("@bazel_skylib//rules:write_file.bzl", "write_file")
load("@build_bazel_rules_nodejs//:index.bzl", "copy_to_bin")

def testcafe_batch_test(name, app_name, data, serve_script, starting_port = 11111, testcafe_files = [], args = [], env = {}, timeout = "long", **kwargs):
    """Creates a testcafe test wrapper

    Args:
        name: name of the target
        app_name: folder name to store artifacts during CI run
        data: source files (tests and non-test files)
        serve_script: argument that starts your app
        starting_port: starting port that will increment every run
        testcafe_files: array containing globs for each seperate tests you want to run
        args: extra arguments to pass
        env: environment value for testcafe to use
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

    port = starting_port
    test_num = 0
    for testcafe_file in testcafe_files:
        copy_to_bin(
            name = "copy_testcafe_files_%s" % test_num,
            srcs = testcafe_file,
        )

        test_env = {}
        for key in env.keys():
            test_env[key] = env[key]
        test_env["BASE_URL"] = "http://localhost:%s" % port

        _testcafe(
            name = "%s_base_%s" % (name, test_num),
            data = [
                "@npm//@ffmpeg-installer/ffmpeg",
                "@npm//kill-port",
                "@npm//serve",
            ] + data + ["copy_testcafe_files_%s" % test_num],
            env = test_env,
            **kwargs
        )

        native.sh_test(
            name = "%s_chunk_%s" % (name, test_num),
            srcs = ["//rules/test:testcafe_test.sh"],
            args = [app_name] + ["$(rootpath :%s_base_%s)" % (name, test_num)] + [
                "--node_options=--require=./$(rootpath %s)" % file_name,
            ] + args + ["--app '%s %s'" % (serve_script, port)],
            data = [
                "@npm//kill-port",
                "@npm//serve",
                file_name,
                ":%s_base_%s" % (name, test_num),
            ],
            timeout = timeout,
            **kwargs
        )

        test_num = test_num + 1
        port = port + test_num
