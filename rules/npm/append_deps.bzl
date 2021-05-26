"""append_deps wrapper for generating dependencies for package.json"""

load("@build_bazel_rules_nodejs//:providers.bzl", "JSModuleInfo")

def _append_deps_impl(ctx):
    out_file = ctx.actions.declare_file("package.json")

    packages = []
    for dep in ctx.attr.dependencies:
        for source in dep[JSModuleInfo].direct_sources.to_list():
            if (source.basename == "package.json"):
                # If a package (e.g. nodegit) has submodules (vendor/libgit2)
                # we don't want their name and version to appear in resulting package.json.
                # Since Starlark does not come with match regexp function we are filtering out paths
                # where node_modules appering not on the second last position of the path.
                # For example:
                # external/npm/node_modules/nodegit - true
                # external/npm/node_modules/nodegit/vendor/libgit2 - false
                # We also want to skip internal packages from checking
                if source.dirname.find("node_modules") > -1:
                    parts = source.dirname.split("/")
                    if (len(parts) - 1 - parts.index("node_modules") == 1):
                        packages.append(source)
                else:
                    packages.append(source)

    dev_packages = []
    for dep in ctx.attr.dev_dependencies:
        for source in dep[JSModuleInfo].direct_sources.to_list():
            if (source.basename == "package.json"):
                dev_packages.append(source)

    ctx.actions.run(
        inputs = depset(packages + dev_packages + [ctx.file.package]),
        outputs = [out_file],
        arguments = [out_file.path, ctx.file.package.path, ",".join([package.path for package in packages]), ",".join([package.path for package in dev_packages])],
        executable = ctx.executable._append_deps,
    )

    return DefaultInfo(files = depset([out_file]))

append_deps = rule(
    implementation = _append_deps_impl,
    attrs = {
        "dependencies": attr.label_list(
            allow_files = True,
            doc = "Direct dependencies",
        ),
        "dev_dependencies": attr.label_list(
            allow_files = True,
            doc = "Direct devDependencies",
        ),
        "package": attr.label(
            allow_single_file = True,
            doc = "package.json file",
        ),
        "_append_deps": attr.label(
            default = "//rules/npm:append_deps",
            cfg = "exec",
            executable = True,
        ),
    },
)
