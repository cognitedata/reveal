"""
Simple rule which is responsible for tracking :build dependencies.s
"""

load("@com_cognitedata_bazel_snapshots//snapshots:snapshots.bzl", "create_tracker_file")

def _publish_fas(ctx):
    out_file = ctx.actions.declare_file(ctx.label.name + ".bash")

    substitutions = {
        "@@PRODUCTION_APP_ID@@": ctx.attr.production_app_id,
        "@@STAGING_APP_ID@@": ctx.attr.staging_app_id,
        "@@REPO_ID@@": ctx.attr.repo_id,
        "@@SENTRY_PROJECT_NAME@@": ctx.attr.sentry_project_name,
        "@@PREVIEW_SUBDOMAIN@@": ctx.attr.preview_subdomain,
        "@@VERSIONING_STRATEGY@@": ctx.attr.versioning_strategy,
        "@@PACKAGE_JSON_PATH@@": ctx.file.package_json.path,
        "@@SHOULD_PUBLISH_SOURCE_MAP@@": "true" if ctx.attr.sentry_project_name else "false",
        "@@FUSION_PREVIEW@@": "true" if ctx.attr.fusion_preview else "false",
    }
    ctx.actions.expand_template(
        template = ctx.file._runner,
        output = out_file,
        substitutions = substitutions,
        is_executable = True,
    )
    runfiles = ctx.runfiles(
        files = [ctx.file.package_json],
    )
    tracked_files = [ctx.file.package_json] + ctx.files.deps
    tracker_file = create_tracker_file(
        ctx,
        tracked_files,
        run = [ctx.label],
        tags = ["publish_fas"],
    )
    return [DefaultInfo(
        files = depset([out_file]),
        runfiles = runfiles,
        executable = out_file,
    ), tracker_file]

publish_fas = rule(
    implementation = _publish_fas,
    attrs = {
        "production_app_id": attr.string(
            doc = "FAS production app id",
            mandatory = True,
        ),
        "staging_app_id": attr.string(
            doc = "FAS staging app id",
            mandatory = True,
        ),
        "repo_id": attr.string(
            doc = "FAS app identifier (repo) shared across both production and staging apps",
            mandatory = True,
        ),
        "sentry_project_name": attr.string(
            doc = "Sentry project name",
            mandatory = True,
        ),
        "preview_subdomain": attr.string(
            doc = "Subdomain name used for the pull requests preview. If omitted, the underlying GitHub repo is detected and used.",
            default = "",
        ),
        "versioning_strategy": attr.string(
            doc = "This determines how this app is versioned. See https://cog.link/releases for more information",
            # single-branch | multi-branch
            default = "single-branch",
        ),
        "package_json": attr.label(
            doc = "The package.json to take version from",
            allow_single_file = True,
            mandatory = True,
        ),
        "build": attr.label(
            allow_files = True,
            doc = "Build",
            mandatory = True,
        ),
        "deps": attr.label_list(
            allow_files = True,
            doc = "Dependencies for tracker",
            mandatory = True,
        ),
        "fusion_preview": attr.bool(
            doc = "Fusion Preview Link",
            mandatory = False,
            default = False,
        ),
        "_runner": attr.label(
            default = "//rules/publish:publish_fas.template.bash",
            allow_single_file = True,
        ),
        "_snapshots": attr.label(
            default = "@snapshots-bin//:snapshots",
            cfg = "exec",
            executable = True,
            allow_single_file = True,
        ),
    },
    executable = True,
)
