"""
Simple rule which is responsible for tracking docker and service src dependencies updates
and for printing out json needed for jenkins to push to docker registry.

This rule is used separately from spinnaker_deployments for services which do not require spinnaker
"""

load("@io_bazel_rules_docker//container:providers.bzl", "BundleInfo")

def _docker_push(ctx):
    out_file = ctx.actions.declare_file(ctx.label.name + ".bash")

    substitutions = {
        "@@SERVICE_NAME@@": ctx.attr.service_name,
    }
    ctx.actions.expand_template(
        template = ctx.file._runner,
        output = out_file,
        substitutions = substitutions,
        is_executable = True,
    )
    runfiles = ctx.runfiles(
        files = [],
    )
    return [DefaultInfo(
        files = depset([out_file]),
        runfiles = runfiles,
        executable = out_file,
    )]

docker_push = rule(
    implementation = _docker_push,
    attrs = {
        "service_name": attr.string(
            doc = "Service name",
        ),
        "bundle": attr.label(
            doc = "The push target",
            providers = [BundleInfo],
            mandatory = False,
        ),
        "deps": attr.label_list(
            # Prebuilding images from Dockerfile takes significant time.
            # Instead of always prebuild them in order to check the changes
            # we can rather listen for changes of underlying files (e.g. Dockerfile)
            doc = "The dependencies change to listen when push target is not provided",
            allow_files = True,
            mandatory = False,
        ),
        "_runner": attr.label(
            default = "//rules/spinnaker:docker_push.template.bash",
            allow_single_file = True,
        ),
    },
    executable = True,
)
