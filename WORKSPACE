# Declares that this directory is the root of a Bazel workspace.
# See https://docs.bazel.build/versions/master/build-ref.html#workspace
workspace(
    # How this workspace would be referenced with absolute labels from another workspace
    name = "applications",
    # Map the npm bazel workspaces to the node_modules directories.
    # This lets Bazel use the sane node_modules as other local tooling.
    managed_directories = {
        "@npm": ["node_modules"],
    },
)

# Install the nodejs "bootstrap" package
# This provides the basic tools for running and packaging nodejs programs in Bazel
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "b32a4713b45095e9e1921a7fcb1adf584bc05959f3336e7351bcf77f015a2d7c",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/4.1.0/rules_nodejs-4.1.0.tar.gz"],
)

load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories", "yarn_install")

# Controls which version of NodeJS and Yarn to use. For more information, check
# https://bazelbuild.github.io/rules_nodejs/install.html
node_repositories(
    node_version = "14.17.6",
    yarn_version = "1.22.4",
)

# The yarn_install rule runs yarn anytime the package.json or yarn.lock file changes.
# It also extracts any Bazel rules distributed in an npm package.
yarn_install(
    name = "npm",
    package_json = "//:package.json",
    # firebase-updater-* packages require explicit listing of transitive dependencies
    # which we don't want to install
    strict_visibility = False,
    yarn_lock = "//:yarn.lock",
)

# Install the Docker rules for Blazier required dependencies
http_archive(
    name = "io_bazel_rules_docker",
    sha256 = "1f4e59843b61981a96835dc4ac377ad4da9f8c334ebe5e0bb3f58f80c09735f4",
    strip_prefix = "rules_docker-0.19.0",
    urls = ["https://github.com/bazelbuild/rules_docker/releases/download/v0.19.0/rules_docker-v0.19.0.tar.gz"],
)

load(
    "@io_bazel_rules_docker//repositories:repositories.bzl",
    container_repositories = "repositories",
)

container_repositories()

load(
    "@io_bazel_rules_docker//repositories:deps.bzl",
    container_deps = "deps",
)

container_deps()

# Blazier

load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
    name = "com_github_cognitedata_blazier",
    commit = "20ed312e9abeacd840a2244f9ca542a6ecd43e74",
    remote = "git@github.com:cognitedata/blazier.git",
    shallow_since = "1605894681 +0100",
)

load("@com_github_cognitedata_blazier//:deps.bzl", "blazier_dependencies")

blazier_dependencies()

# Cognite Bazel tools

git_repository(
    name = "com_github_cognitedata_bazel_tools",
    commit = "3369d775258b19aea6a6ccfd2616ed39eb72e9ed",
    remote = "git@github.com:cognitedata/bazel-tools.git",
    shallow_since = "1618568907 +0200",
)

load("@com_github_cognitedata_bazel_tools//:deps.bzl", "cognitedata_bazel_tools_deps")

cognitedata_bazel_tools_deps()
