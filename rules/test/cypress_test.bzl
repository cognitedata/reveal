"""
Cypress batch test rules
"""

load("@npm//cypress:index.bzl", "cypress")
load("@npm//@bazel/cypress:index.bzl", "cypress_web_test")
load("@npm//@bazel/typescript:index.bzl", "ts_project")
load("@build_bazel_rules_nodejs//:providers.bzl", "DeclarationInfo", "JSModuleInfo")

def _is_file_in_batch(file, batch):
    filename = file.short_path.replace(".js", ".ts")
    for sourceFile in batch:
        if filename == sourceFile.short_path:
            return True
    return False

def _extract_batch_impl(ctx):
    data = []
    for file in ctx.files.cypress_files:
        if _is_file_in_batch(file, ctx.files.batch):
            data.append(file)
        elif file.short_path.endswith("spec.js") == False:
            data.append(file)
    data = depset(data)
    return_info = [
        JSModuleInfo(
            direct_sources = data,
            sources = data,
        ),
    ]
    if DeclarationInfo in ctx.attr.cypress_files:
        return_info.append(ctx.attr.cypress_files[DeclarationInfo])
    return return_info

_extract_batch = rule(
    implementation = _extract_batch_impl,
    attrs = {
        "cypress_files": attr.label(
            allow_files = True,
        ),
        "batch": attr.label_list(
            allow_files = True,
        ),
    },
)

def _plugin_file_impl(ctx):
    data = []
    for file in ctx.files.cypress_files:
        if file.short_path.endswith("cypress/plugin.js"):
            data.append(file)
    data = depset(data)
    return DefaultInfo(files = data)

_plugin_file = rule(
    implementation = _plugin_file_impl,
    attrs = {
        "cypress_files": attr.label(
            allow_files = True,
        ),
    },
)

def cypress_test(name, app_name, build_src, ts_deps, web_test_deps, cypress_files, batches, starting_port, support_files = True, fixture_files = False, **kwargs):
    """Creates a wrapper around cypress tests for batch runs

    Args:
        name: name of the target
        app_name: name of the app
        build_src: folder containing the built app
        ts_deps: dependencies for typescript sources
        web_test_deps: additional dependencies to run cypress
        cypress_files: array containing globs for each seperate tests you want to run
        batches: list of globs splitting tests into batches
        starting_port: starting port that will increment every run
        support_files: whether to include support files in the config
        fixture_files: whether to include fixture files in the config
        **kwargs: rest of arguments passed to cypress
    """

    ts_project(
        name = "%s.cypress_files" % name,
        srcs = cypress_files,
        extends = "cypress/tsconfig.json",
        tsconfig = {},
        deps = ts_deps,
    )

    _plugin_file(
        name = "%s.plugin_file" % name,
        cypress_files = "%s.cypress_files" % name,
    )

    optional_config = ""

    if support_files:
        optional_config = optional_config + ",supportFile=./apps/%s/cypress/support" % app_name
    if fixture_files:
        optional_config = optional_config + ",fixturesFolder=./apps/%s/cypress/fixtures" % app_name

    port = starting_port
    test_num = 0
    for batch in batches:
        _extract_batch(
            name = "%s.batch_files_%s" % (name, test_num),
            cypress_files = "%s.cypress_files" % name,
            batch = batch,
        )

        cypress_web_test(
            # The name of your test target
            name = "%s.batch_%s_test" % (name, test_num),
            srcs = [
                "%s.batch_files_%s" % (name, test_num),
            ],
            size = "large",
            # A cypress config file is required
            config_file = "cypress.json",
            # Any runtime dependencies you need to boot your server or run your tests
            data = [
                build_src,
            ] + web_test_deps,
            env = {
                "PORT": "%s" % port,
                "DISPLAY": ":99",
            },
            # Your cypress plugin used to configure cypress and boot your server
            plugin_file = "%s.plugin_file" % name,
            templated_args = [
                "--config " +
                "integrationFolder=./apps/%s/cypress/integration," % app_name +
                "pluginsFile=./apps/%s/cypress/plugin.js," % app_name +
                "videosFolder=$TEST_UNDECLARED_OUTPUTS_DIR/test.outputs/%s/video," % app_name +
                "screenshotsFolder=$TEST_UNDECLARED_OUTPUTS_DIR/test.outputs/%s/screenshots" % app_name +
                optional_config,
            ],
            tags = [
                "ignore_test_in_cd",
            ],
            **kwargs
        )

        test_num = test_num + 1
        port = port + test_num

    cypress(
        name = "%s.manual" % name,
        args = [
            "run",
            "--headed",
            "--project ./apps/%s" % app_name,
            "--spec ./apps/%s/cypress/**/*.spec.js" % app_name,
            "--env BASE_URL=https://localhost:3000",
        ],
        data = [
            "cypress.json",
            "%s.cypress_files" % name,
        ],
        tags = ["manual"],
    )
