"""
Simple rule which is responsible for tracking spinnaker, baker and service src dependencies updates
and for printing out json needed for jenkins to push to docker registry and run spinnaker.deploy
"""

load("@io_bazel_rules_docker//container:providers.bzl", "PushInfo")
load("//rules/spinnaker:spinnaker_pipeline.bzl", "SpinnakerPipelineInfo")

def _spinnaker_deployment(ctx):
    out_file = ctx.actions.declare_file(ctx.label.name + ".bash")

    substitutions = {
        "@@SERVICE_NAME@@": ctx.attr.service_name,
        "@@PIPELINES@@": "[" + ",".join(["\"" + name + "\"" for name in ctx.attr.spinnaker_pipeline[SpinnakerPipelineInfo].pipeline_names]) + "]" if ctx.attr.spinnaker_pipeline else "\"\"",
        "@@MANIFEST@@": ctx.file.manifest.path if ctx.file.manifest else "",
        "@@DOCKER_REPOSITORY@@": ctx.attr.image[PushInfo].repository if ctx.attr.image else "",
    }
    ctx.actions.expand_template(
        template = ctx.file._runner,
        output = out_file,
        substitutions = substitutions,
        is_executable = True,
    )
    runfiles = ctx.runfiles(
        files = [ctx.attr.image[PushInfo].digest] if ctx.attr.image else [],
    )
    return [DefaultInfo(
        files = depset([out_file]),
        runfiles = runfiles,
        executable = out_file,
    )]

spinnaker_deployment = rule(
    implementation = _spinnaker_deployment,
    attrs = {
        "service_name": attr.string(
            doc = "Service name",
        ),
        "manifest": attr.label(
            doc = "Manifest",
            allow_single_file = True,
            mandatory = False,
        ),
        "spinnaker_pipeline": attr.label(
            allow_files = True,
            doc = "Spinnaker pipelines",
            mandatory = False,
        ),
        "baked_manifests": attr.label_list(
            allow_files = True,
            doc = "Baker manifests",
            mandatory = False,
        ),
        "deps": attr.label_list(
            allow_files = True,
            doc = "Dependencies",
            mandatory = False,
        ),
        "image": attr.label(
            doc = "The push target",
            providers = [PushInfo],
            mandatory = False,
        ),
        "_runner": attr.label(
            default = "//rules/spinnaker:spinnaker_deployment.template.bash",
            allow_single_file = True,
        ),
    },
    executable = True,
)
