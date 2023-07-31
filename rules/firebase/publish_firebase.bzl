"""
Simple rule which is responsible for tracking :build dependencies.s
"""

load("@com_cognitedata_bazel_snapshots//snapshots:snapshots.bzl", "create_tracker_file")

def _publish_firebase(ctx):
    out_file = ctx.actions.declare_file(ctx.label.name + ".bash")

    substitutions = {
        "@@PREVIEW_SUBDOMAIN@@": ctx.attr.preview_subdomain,
        "@@BUILD_FOLDER@@": ctx.attr.build_folder,
        "@@FIREBASE_JSON_PATH@@": ctx.attr.firebase_json_path,
        "@@PACKAGE_JSON_PATH@@": ctx.file.package_json.path,
        "@@FIREBASE_APP_SITE@@": ctx.attr.firebase_app_site,
        "@@IS_FUSION_SUBAPP@@": "true" if ctx.attr.is_fusion_subapp else "false",
        "@@FUSION_APP_ID@@": ctx.attr.fusion_app_id,
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
        tags = ["publish_firebase"],
    )
    return [DefaultInfo(
        files = depset([out_file]),
        runfiles = runfiles,
        executable = out_file,
    ), tracker_file]

publish_firebase = rule(
    implementation = _publish_firebase,
    attrs = {
        "firebase_app_site": attr.string(
            doc = "Firebase app site",
            mandatory = True,
        ),
        "preview_subdomain": attr.string(
            doc = "Subdomain name used for the pull requests preview. If omitted, the underlying GitHub repo is detected and used.",
            default = "",
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
        "build_folder": attr.string(
            doc = "Output build folder",
            mandatory = True,
        ),
        "firebase_json_path": attr.string(
            doc = "Path to firebase.json configuration file",
            mandatory = True,
        ),
        "deps": attr.label_list(
            allow_files = True,
            doc = "Dependencies for tracker",
            mandatory = True,
        ),
        "is_fusion_subapp": attr.bool(
            doc = "Fusion Preview Link",
            mandatory = False,
            default = False,
        ),
        "_runner": attr.label(
            default = "//rules/firebase:publish_firebase.template.bash",
            allow_single_file = True,
        ),
        "_snapshots": attr.label(
            default = "@snapshots-bin//:snapshots",
            cfg = "exec",
            executable = True,
            allow_single_file = True,
        ),
        "fusion_app_id": attr.string(
            doc = "Fusion app identifier",
            mandatory = False,
        ),
    },
    executable = True,
)
