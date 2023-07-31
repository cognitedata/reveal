"""Container build rules"""

load("@io_bazel_rules_docker//container:container.bzl", "container_image", "container_layer", "container_push")
load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")
load("@npm//@cognite/fas-tools:index.bzl", "fas_tools")
load("//rules/docker:prepare_docker_build.bzl", "prepare_docker_build")
load("//rules/spinnaker:spinnaker_deployment.bzl", "spinnaker_deployment")

def container_build(name, app_name, app_id, build_layer, docker_repo, environment, config_map):
    """
    A set of rules needed to publish images

    Args:
        name: name of that most targets will expand
        app_name: name of the app
        app_id: id of the app
        build_layer: target to the built files
        docker_repo: the remote docker repository path to push to
        environment: release, staging or production
        config_map: path to the base configmap the build will use

    Important rules:
        - [name]_get_releases: uses fas-tools to retrieve a csv with paths to the google bucket containing the builds
        - [name]_prepare_docker_build: Creates a directory containing the builds and config map that the docker image will serve
        - push_[environment]: pushes the docker image into the remote docker repository
        - spinnaker_deployment_[environment]: deploys the configuration into spinnaker
    """
    fas_tools(
        name = "%s_get_releases" % name,
        args = [
            "get-releases",
            "-d %s" % app_id,
            "-p $(execpath :%s)" % config_map,
        ],
        data = [
            ":%s" % config_map,
            "//apps:google_application_credentials.json",
        ],
        env = {
            "GOOGLE_APPLICATION_CREDENTIALS": "$(execpath //apps:google_application_credentials.json)",
        },
        output_dir = True,
        stdout = "%s_get_releases/releases.csv" % name,
        tags = ["manual"],
    )

    nodejs_binary(
        name = "%s_prepare_docker_binary" % name,
        data = ["//rules/docker:prepare_docker.mjs"],
        entry_point = "//rules/docker:prepare_docker.mjs",
        env = {
            "GCLOUD_PROJECT": "cognitedata-development",
        },
        tags = ["manual"],
    )

    prepare_docker_build(
        name = "%s_prepare_docker_build" % name,
        binary = ":%s_prepare_docker_binary" % name,
        config_map = ":%s" % config_map,
        get_release = ":%s_get_releases/releases.csv" % name,
        google_credentials = "//apps:google_application_credentials.json",
        out_dir = app_id,
        tags = ["manual"],
    )

    container_layer(
        name = "%s_app_layer" % name,
        directory = "/var/www/html",
        files = [":%s_prepare_docker_build" % name],
        tags = ["manual"],
        visibility = ["//visibility:private"],
    )

    container_image(
        name = "%s_image" % name,
        base = "//apps:caddy_image",
        entrypoint = [
            "/usr/share/bin/entrypoint.sh",
        ],
        layers = [
            ":%s_app_layer" % name,
        ],
        ports = [
            "8080/tcp",
            "2019/tcp",
        ],
        tags = ["manual"],
        visibility = ["//visibility:private"],
    )

    # Called from Jenkins
    container_push(
        name = "push_%s" % environment,
        format = "Docker",
        image = ":%s_image" % name,
        registry = "eu.gcr.io",
        repository = docker_repo,
        tag = "{BUILD_USER}-{BUILD_TIMESTAMP}",
        tags = ["manual"],
    )

    # Called from Jenkins
    spinnaker_deployment(
        name = "spinnaker_deployment_%s" % environment,
        # TODO: Change manifests: staging / prod ones?
        baked_manifests = ["//.baker:%s-manifests" % app_name],
        image = ":push_%s" % environment,
        service_name = app_name,
        spinnaker_pipeline = "//spinnaker-config/%s:spinnaker-config-%s" % (app_name, environment),
        tags = ["manual"],
        deps = [
            build_layer,
        ],
    )
