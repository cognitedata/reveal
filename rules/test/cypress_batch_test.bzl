"""
Test rules
"""

load("@npm//@bazel/cypress:index.bzl", "cypress_web_test")
load("@npm//@bazel/typescript:index.bzl", "ts_project")

def cypress_batch_test(name, build_src, cypress_folder, global_cypress_files, cypress_files, starting_port, **kwargs):
    """Creates a react-scripts test wrapper

    Args:
        name: name of the target
        build_src: folder containing the built app
        cypress_folder: folder containing cypress files
        global_cypress_files: files needed for every cypress run
        cypress_files: array containing globs for each seperate tests you want to run
        starting_port: starting port that will increment every run
        **kwargs: rest of arguments passed to cypress
    """

    ts_project(
        name = "%s_plugin_file" % name,
        # srcs = ["cypress/plugin.ts"],
        srcs = ["%s/plugin.ts" % cypress_folder],
        extends = "%s/tsconfig.json" % cypress_folder,
        tsconfig = {
            "compilerOptions": {
                "types": ["node"],
            },
        },
        deps = [
            "@npm//@types/node",
            "@npm//express",
        ],
    )

    port = starting_port
    test_num = 0
    for cypress_file in cypress_files:
        ts_project(
            name = "%s_cypress_project_%s" % (name, test_num),
            srcs = cypress_file + global_cypress_files,
            extends = "%s/tsconfig.json" % cypress_folder,
            tsconfig = {
                "compilerOptions": {
                    "types": ["cypress"],
                },
            },
            out_dir = "%s" % test_num,
            deps = [
                "@npm//cypress",
            ],
        )

        cypress_web_test(
            # The name of your test target
            name = "%s_chunk_%s" % (name, test_num),
            srcs = [
                build_src,
                ":%s_cypress_project_%s" % (name, test_num),
            ],
            # A cypress config file is required
            config_file = "cypress.json",
            # Any runtime dependencies you need to boot your server or run your tests
            data = [
                "@npm//express",
            ],
            env = {
                "PORT": "%s" % port,
            },
            # Your cypress plugin used to configure cypress and boot your server
            plugin_file = ":%s_plugin_file" % name,
            **kwargs
        )

        test_num = test_num + 1
        port = port + test_num
