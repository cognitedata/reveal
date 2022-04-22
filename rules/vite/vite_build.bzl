"""Temporary rule to remove '/' in front of PUBLIC_URL_VALUE while waiting for vite to add the functionality"""

load(":build_sed.bzl", "build_sed")
load("@npm//vite:index.bzl", "vite")

def vite_build(name, args, **kwargs):
    """Wraps the buildier to format CDN links properly

    Args:
        name: name of the target
        args: extra arguments to pass
        **kwargs: standard vite build arguments
    """

    native.sh_binary(
        name = "%s_build_sed_default" % name,
        srcs = ["//rules/vite:sed_linux.sh"],
    )

    native.sh_binary(
        name = "%s_build_sed_darwin" % name,
        srcs = ["//rules/vite:sed_darwin.sh"],
    )

    build_sed(
        name = name,
        binary = select({
            "@bazel_tools//src/conditions:darwin": ":%s_build_sed_darwin" % name,
            "//conditions:default": ":%s_build_sed_default" % name,
        }),
        out_dir = name,
        src_dir = "%s_tmp" % name,
    )

    vite(
        name = "%s_tmp" % name,
        args = args + [
            "--outDir=%s_tmp" % name,
        ],
        **kwargs
    )
