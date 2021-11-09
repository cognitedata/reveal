"""
Simple rule which sets dependencies on spinnaker-configs and outputs app-config.yaml
"""

load("@bazel_skylib//lib:paths.bzl", "paths")

SpinnakerPipelineInfo = provider("spinnaker-pipeline", fields = ["files", "runfiles", "data_runfiles", "default_runfiles", "executable", "pipeline_names"])

def _spinnaker_pipeline_impl(ctx):
    out_file = ctx.actions.declare_file(ctx.label.name + ".bash")

    pipeline_files = []
    for pipeline in ctx.attr.pipeline_configs:
        for file in pipeline[DefaultInfo].files.to_list():
            parts = paths.split_extension(file.path)
            if parts[len(parts) - 1] == ".yaml" and paths.basename(file.path) != "app-config.yaml":
                pipeline_files.append(file)

    pipeline_names = [paths.split_extension(paths.basename(file.path))[0] for file in pipeline_files]

    substitutions = {
        "@@APP_CONFIG_PATH@@": ctx.file.app_config.path,
    }
    ctx.actions.expand_template(
        template = ctx.file._runner,
        output = out_file,
        substitutions = substitutions,
        is_executable = True,
    )
    runfiles = ctx.runfiles(
        files = ctx.files.pipeline_configs + ctx.files.app_config,
    )
    return [DefaultInfo(
        files = depset([out_file] + ctx.files.app_config + ctx.files.pipeline_configs),
        runfiles = runfiles,
        executable = out_file,
    ), SpinnakerPipelineInfo(
        pipeline_names = pipeline_names,
    )]

spinnaker_pipeline = rule(
    implementation = _spinnaker_pipeline_impl,
    attrs = {
        "pipeline_configs": attr.label_list(
            allow_files = True,
            doc = "Source files",
        ),
        "app_config": attr.label(
            allow_single_file = True,
            doc = "Spinnaker config app file",
        ),
        "_runner": attr.label(
            default = "//rules/spinnaker:spinnaker_pipeline.template.bash",
            allow_single_file = True,
        ),
    },
    executable = True,
)
