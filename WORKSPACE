# Declares that this directory is the root of a Bazel workspace.
# See https://docs.bazel.build/versions/master/build-ref.html#workspace
workspace(
    # How this workspace would be referenced with absolute labels from another workspace
    name = "applications",
)

# Install the nodejs "bootstrap" package
# This provides the basic tools for running and packaging nodejs programs in Bazel
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive", "http_file")

http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "5aae76dced38f784b58d9776e4ab12278bc156a9ed2b1d9fcd3e39921dc88fda",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.7.1/rules_nodejs-5.7.1.tar.gz"],
)

load("@build_bazel_rules_nodejs//:repositories.bzl", "build_bazel_rules_nodejs_dependencies")

build_bazel_rules_nodejs_dependencies()

load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories", "yarn_install")

# Controls which version of NodeJS and Yarn to use. For more information, check
# https://bazelbuild.github.io/rules_nodejs/install.html
node_repositories(
    node_version = "16.10.0",
    yarn_version = "1.22.17",
)

# The yarn_install rule runs yarn anytime the package.json or yarn.lock file changes.
# It also extracts any Bazel rules distributed in an npm package.
yarn_install(
    name = "npm",
    data = [
        "//:patches/@cognite+cogs.js+7.8.3.patch",
        "//:patches/@storybook+core-server+6.5.10.patch",
        "//:patches/react-virtualized+9.22.3.patch",
        "//:patches/resize-observer-polyfill+1.5.1.patch",
    ],
    exports_directories_only = False,
    package_json = "//:package.json",
    # firebase-updater-* packages require explicit listing of transitive dependencies
    # which we don't want to install
    strict_visibility = False,
    symlink_node_modules = True,
    yarn_lock = "//:yarn.lock",
)

# Install the Docker rules for Blazier required dependencies
http_archive(
    name = "io_bazel_rules_docker",
    sha256 = "b1e80761a8a8243d03ebca8845e9cc1ba6c82ce7c5179ce2b295cd36f7e394bf",
    urls = ["https://github.com/bazelbuild/rules_docker/releases/download/v0.25.0/rules_docker-v0.25.0.tar.gz"],
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

load("@io_bazel_rules_docker//container:container.bzl", "container_pull")

container_pull(
    name = "buster_base",
    digest = "sha256:f6ed7ce6e3264649e1d4f40585247c50e32faaf268984c5c5cbf0e67cf7f0ec7",
    registry = "index.docker.io",
    repository = "library/debian",
    tag = "buster-slim",
)

# Caddy pgp key

http_file(
    name = "caddy_gpg",
    sha256 = "5791c2fb6b6e82feb5a69834dd2131f4bcc30af0faec37783b2dc1c5c224a82a",
    urls = ["https://dl.cloudsmith.io/public/caddy/stable/gpg.key"],
)

# Cognite Bazel tools

load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
    name = "com_github_cognitedata_bazel_tools",
    commit = "531018e619981451386506f89a324f25f3e3ce73",
    remote = "git@github.com:cognitedata/bazel-tools.git",
    shallow_since = "1626257493 +0200",
)

load("@com_github_cognitedata_bazel_tools//:deps.bzl", "cognitedata_bazel_tools_deps")

cognitedata_bazel_tools_deps()

http_archive(
    name = "com_cognitedata_bazel_snapshots",
    sha256 = "896ccc4939d05305cca0ed3b106411f36d4f9c1a19a41fed53f0fcaeba47f8d5",
    urls = [
        "https://github.com/cognitedata/bazel-snapshots/releases/download/0.3.0/snapshots-0.3.0.tar",
    ],
)

# Put this after rules_docker to avoid overriding the reference to rules_docker

load("@com_cognitedata_bazel_snapshots//:repo.bzl", "snapshots_repos")

snapshots_repos()

# Cypress

load("@build_bazel_rules_nodejs//toolchains/cypress:cypress_repositories.bzl", "cypress_repositories")

# The name you pass here names the external repository you can load cypress_web_test from
cypress_repositories(
    name = "cypress",
    linux_sha256 = "0a8f6617add18bf9ea3c77a4e9d01aaa66ccd1f7572995216fb9e16196a3c7fd",
    version = "9.7.0",
)
