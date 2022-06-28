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
    sha256 = "6f15d75f9e99c19d9291ff8e64e4eb594a6b7d25517760a75ad3621a7a48c2df",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/4.7.0/rules_nodejs-4.7.0.tar.gz"],
)

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
    package_json = "//:package.json",
    # firebase-updater-* packages require explicit listing of transitive dependencies
    # which we don't want to install
    strict_visibility = False,
    yarn_lock = "//:yarn.lock",
)

# Install the Docker rules for Blazier required dependencies
http_archive(
    name = "io_bazel_rules_docker",
    sha256 = "92779d3445e7bdc79b961030b996cb0c91820ade7ffa7edca69273f404b085d5",
    strip_prefix = "rules_docker-0.20.0",
    urls = ["https://github.com/bazelbuild/rules_docker/releases/download/v0.20.0/rules_docker-v0.20.0.tar.gz"],
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
    commit = "531018e619981451386506f89a324f25f3e3ce73",
    remote = "git@github.com:cognitedata/bazel-tools.git",
    shallow_since = "1626257493 +0200",
)

load("@com_github_cognitedata_bazel_tools//:deps.bzl", "cognitedata_bazel_tools_deps")

cognitedata_bazel_tools_deps()

# Cypress

load("@build_bazel_rules_nodejs//toolchains/cypress:cypress_repositories.bzl", "cypress_repositories")

# The name you pass here names the external repository you can load cypress_web_test from
cypress_repositories(
    name = "cypress",
    version = "9.2.1",
)
