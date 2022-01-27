@Library('jenkins-helpers') _

static final String NODE_VERSION = 'node:16'

static final String PR_COMMENT_MARKER = "[pr-server]\n"
static final String STORYBOOK_COMMENT_MARKER = "[storybook-server]\n"

static final Map<String, String> CONTEXTS = [
  checkout: "continuous-integration/jenkins/checkout",
  bazelSetup: "continuous-integration/jenkins/bazel-setup",
  bazelBuild: "continuous-integration/jenkins/bazel-build",
  bazelTests: "continuous-integration/jenkins/bazel-tests",
  publishStorybook: "continuous-integration/jenkins/publish-storybook",
  publishFAS: "continuous-integration/jenkins/publish-fas",
  publishPackages: "continuous-integration/jenkins/publish-packages",
  baker_bake: "cicd/jenkins/baker-bake",
  spinnaker_deployments: 'cicd/jenkins/spinnaker-deployments',
  spinnaker_pipeline: 'cicd/jenkins/spinnaker-pipeline',
  docker_push: 'cicd/jenkins/docker-push',

]

void bazelPod(Map params = new HashMap(), body) {
  def bazelVersion = params.bazelVersion ?: '4.2.1'

  podTemplate(
      containers: [
          containerTemplate(
              name: 'bazel',
              // TODO: Define custom docker image to include bazel instead of installing
              image: "eu.gcr.io/cognitedata/apps-tools/bazel-applications:4.2.1-1",
              command: '/bin/cat -',
              resourceRequestCpu: '3000m',
              resourceLimitCpu: '16000m',
              resourceRequestMemory: '24000Mi',
              resourceLimitMemory: '24000Mi',
              ttyEnabled: true,
              envVars: [
                envVar(key: 'GOOGLE_APPLICATION_CREDENTIALS', value: '/inapp-ci-cd-service-account-credentials/credentials.json'),
              ]
          ),
          containerTemplate(name: 'dockerd',
              image: 'docker:20.10-dind',
              resourceRequestCpu: '1000m',
              resourceLimitCpu: '3000m',
              resourceRequestMemory: '3000Mi',
              resourceLimitMemory: '3000Mi',
              privileged: true,
              command: 'dockerd-entrypoint.sh --host=unix:///var/run/docker/docker.sock --ip 0.0.0.0'
          ),
      ],
      volumes: [
          secretVolume(secretName: 'jenkins-docker-builder', mountPath: '/bazel-docker'),
          secretVolume(secretName: 'jenkins-bazel-build-cache-member', mountPath: '/jenkins-bazel-build-cache-member'),
      ],
  ) {
        body()
    }
}

def fakeIdpEnvVars = [
    envVar(key: 'PORT', value: '8200'),
    envVar(key: 'IDP_USER_ID', value: 'user'),
    envVar(key: 'IDP_CLUSTER', value: 'azure-dev'),
    envVar(key: 'IDP_TOKEN_ID', value: 'demo-app-e2e'),
]

def pods = { body ->
  podTemplate(
    annotations: [
      podAnnotation(key: "jenkins/build-url", value: env.BUILD_URL ?: ""),
      podAnnotation(key: "jenkins/github-pr-url", value: env.CHANGE_URL ?: ""),
    ],
    volumes: [
      secretVolume(
        secretName: 'jenkins-docker-builder',
        mountPath: '/jenkins-docker-builder',
      ),
      secretVolume(
        secretName: 'inapp-ci-cd-service-account-credentials',
        mountPath: '/inapp-ci-cd-service-account-credentials',
      ),
      secretVolume(
        secretName: 'npm-credentials',
        mountPath: '/npm-credentials',
      ),
      emptyDirVolume(
        mountPath: '/var/run/docker',
        memory: false
      ),
    ]
  ) {
    bazelPod(bazelVersion: '4.2.1') {
      spinnaker.pod() {
        yarn.pod(nodeVersion: NODE_VERSION) {
          previewServer.pod(nodeVersion: NODE_VERSION) {
            fas.pod(
              nodeVersion: NODE_VERSION,
              envVars: [
                envVar(key: 'BRANCH_NAME', value: env.BRANCH_NAME),
                envVar(key: 'CHANGE_ID', value: env.CHANGE_ID)
              ]
            ) {
              codecov.pod {
                fakeIdp.pod(
                  fakeIdpEnvVars: fakeIdpEnvVars,
                ) {
                  properties([
                    buildDiscarder(logRotator(daysToKeepStr: '30', numToKeepStr: '100'))
                  ])

                  node(POD_LABEL) {
                      stageWithNotify('Checkout code', CONTEXTS.checkout) {
                        checkout(scm)
                        sh('./rules/test/version_info.sh > ./rules/test/version_info.bzl')
                      }
                    body()
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

def handleError = { err ->
  container('bazel') {
    sh("mkdir -p artifacts")
    sh("find -L `readlink dist/testlogs` -type f -name '*.zip' | xargs -n1 unzip -uo -d artifacts")
    // We execute the find command in a subcommand to actually preserve directory structure
    sh("CURRENTDIR=\$(pwd) && (cd `readlink dist/testlogs` && find -type f -wholename '*testcafe_test*/*.log' | xargs cp --parents -t \$CURRENTDIR/artifacts)")
    sh("CURRENTDIR=\$(pwd) && (cd `readlink dist/testlogs` && find -type f -wholename '*cypress_test*/*.log' | xargs cp --parents -t \$CURRENTDIR/artifacts)")

    def artifactPaths = "artifacts/**/screenshots/**/*.png,artifacts/**/video/**/*.mp4,artifacts/**/cypress/**/*.mp4,artifacts/**/*testcafe_test*/**/*.log,artifacts/**/*cypress_test*/**/*.log"

    archiveArtifacts allowEmptyArchive: true, artifacts: artifactPaths
  }
  throw err
}

pods {
  final boolean isPullRequest = versioning.getEnv().isPullRequest
  final boolean isProduction = versioning.getEnv().isProduction
  final String hasChangedRef = isPullRequest ?
    // for PRs use the commit hash on the master branch that the PR branch is originated from
    "\$(git merge-base refs/remotes/origin/master HEAD)" :
    // for staging/production compare current and previous commit hashes
    "HEAD^1"

  app.safeRun(
    logErrors: !isPullRequest,
    handleError: handleError,
    slackChannel: 'frontend-alerts',
  ) {
    stageWithNotify('Bazel setup', CONTEXTS.bazelSetup) {
      if (isPullRequest) {
        // always cleanup at the start of a run:
        deleteComments(PR_COMMENT_MARKER)
        deleteComments(STORYBOOK_COMMENT_MARKER)
      }
      bazel.dockerAuth()
      container('bazel') {
        sh("cp .ci.bazelrc ~/.bazelrc")
        sh("cd /var/run && ln -s /var/run/docker/docker.sock")
        sh(label: 'Set up NPM', script: 'cp /npm-credentials/npm-public-credentials.txt ~/.npmrc')
        // For cloning Blazier and fetching master
        withCredentials([usernamePassword(credentialsId: scm.userRemoteConfigs[0].credentialsId, passwordVariable: 'GITHUB_TOKEN', usernameVariable: 'GH_USER')]) {
            sh("git config --global credential.helper '!f() { sleep 1; echo \"username=${GH_USER}\"; echo \"password=${GITHUB_TOKEN}\"; }; f'")
            // Override ssh access with https which is supported by Jenkins
            sh('git config --global url."https://github.com/".insteadOf git@github.com:')
            sh("git fetch --no-tags --force --progress -- https://github.com/cognitedata/applications.git +refs/heads/master:refs/remotes/origin/master")
        }
      }
    }

    stageWithNotify("Bazel build", CONTEXTS.bazelBuild) {
      container('bazel') {
        sh(label: 'bazel build //...', script: "bazel --bazelrc=.ci.bazelrc build //...")
      }
    }

    if (!isProduction) {
      stageWithNotify("Baker bake", CONTEXTS.baker_bake) {
        container('bazel') {
          def changedManifests = sh(
            label: "Which manifests were changed?",
            // Find the commit hash on the master branch that the PR branch is originated from
            // If we would want to also run this check in cd.jenkins we would need to change ref to HEAD^1
            script: "bazel run //:has-changed -- -ref=\$(git merge-base refs/remotes/origin/master HEAD) 'kind(baker_bake, //...)'",
            returnStdout: true
          )
          print(changedManifests)
          if (changedManifests) {
            def serviceNames = []
            changedManifests.split('\n').each {
              def jsonString = sh(script: "bazel run ${it}", returnStdout: true)
              def params = readJSON text: jsonString
              print(params)
              serviceNames.add(params.name)
            }
            def serviceNamesStr = serviceNames.join(',')
            sh(label: './bake_manifests.sh bake --services', script: "./bake_manifests.sh bake --services ${serviceNamesStr} --parallel 32")
            try {
              def gitStatus = sh(
                script: 'test -z "$(git status -s .baker/manifests --porcelain)"',
                returnStdout: true
              ).trim()
            } catch(ex) {
              exMessage = "There are some untracked changes to .baker/manifests files. Run ./bake_manifests.sh locally and check in the changes."
              throw new Exception("${exMessage}\n${ex}")
            }
          }
        }
      }
    }

    stageWithNotify('Bazel test', CONTEXTS.bazelTests) {
      container('bazel') {
        sh(label: 'lint bazel files', script: "bazel --bazelrc=.ci.bazelrc run //:buildifier_check")
        sh(label: 'bazel test //...', script: "bazel --bazelrc=.ci.bazelrc test //...")

        // Bazel stores test outputs as zip files
        sh("find -L `readlink dist/testlogs` -type f -name '*.zip' | xargs -n1 unzip -uo")
        // junit takes into account only reports no older than 3s
        // for cached by Bazel tests we are updating file timestamp
        // in order to take them into account as well
        sh("find test.outputs -type f -name '*.xml' | xargs touch")
        junit(allowEmptyResults: true, testResults: '**/junit.xml')
        if (isPullRequest) {
          summarizeTestResults()
        }
        stage("Upload coverage reports") {
          codecov.uploadCoverageReport()
        }
      }
    }

    if (isPullRequest) {
      stageWithNotify('Publish storybook', CONTEXTS.publishStorybook) {
        container('bazel') {
          def changedStorybooks = sh(
            label: "Which storybooks were changed?",
            script: "bazel run //:has-changed -- -ref=${hasChangedRef} 'kind(publish_storybook, //...)'",
            returnStdout: true
          )
          print(changedStorybooks)
          if (changedStorybooks) {
            changedStorybooks.split('\n').each {
              def storybookJsonString = sh(script: "bazel run ${it}", returnStdout: true)
              def params = readJSON text: storybookJsonString
              def target = it.split(':')[0].split('//')[1]
              sh("rm -rf storybook-static && cp -r `readlink dist/bin`/${target}/storybook-static storybook-static")
              previewServer(
                buildFolder: 'storybook-static',
                commentPrefix: '[storybook-server]\n',
                prefix: 'storybook',
                repo: params.sub_domain
              )
            }
          }
        }
      }
    }

    def slackMessages = []

    stageWithNotify('Publish FAS', CONTEXTS.publishFAS) {
      container('bazel') {
        def changedApps = sh(
          label: "Which apps were changed?",
          script: "bazel run //:has-changed -- -ref=${hasChangedRef} 'kind(publish_fas, //...)'",
          returnStdout: true
        )
        print(changedApps)
        if (changedApps) {
          changedApps.split('\n').each {
            def fasJsonString = sh(script: "bazel run ${it}", returnStdout: true)
            def params = readJSON text: fasJsonString
            print(params)
            def target = it.split(':')[0].split('//')[1]

            def publish = { args ->
              def performBuild = { p ->
                container('bazel') {
                  // clean up after the previous run
                  sh("rm -rf build && cp -r `readlink dist/bin`/${args.src}/build build")
                  def fasBuildJsonString = sh(
                    script: "cat .fas-build.json",
                    returnStdout: true
                  )
                  def fasBuildJson = readJSON text: fasBuildJsonString
                  def fasBuildEnv = fasBuildJson.build.env
                  // Iterate over generated env vars and replace placeholder values defined in BUILD.bazel
                  for (key in fasBuildEnv.keySet()) {
                    def value = fasBuildEnv.get(key)
                    sh("find build -type f | xargs sed -i 's,${key}_VALUE,${value},g'")
                  }
                  // We are setting REACT_APP_ENV/NODE_ENV based on the build target, similarly to scripts/build.sh
                  def variant = args.variant ?: 'development'
                  sh("find build -type f | xargs sed -i 's,REACT_APP_ENV_VALUE,${variant},g'")
                  sh("find build -type f | xargs sed -i 's,NODE_ENV_VALUE,${variant},g'")                  
                }
              }
              fas.build(
                appId: args.appId,
                repo: args.repo,
                sentryProjectName: args.sentryProjectName,
                performBuild: performBuild,
                baseVersion: args.baseVersion,
                shouldInstallPackages: false,
              )
              fas.publish(
                previewSubdomain: args.previewSubdomain
              )
            }

            static final Map<String, Boolean> version = versioning.getEnv(
              versioningStrategy: params.versioning_strategy
            )

            if (isPullRequest) {
              publish(
                src: target,
                appId: "${params.staging_app_id}-pr-${env.CHANGE_ID}",
                repo: params.repo_id,
                sentryProjectName: params.sentry_project_name,
                variant: 'preview',
                previewSubdomain: params.preview_subdomain != "" ? params.preview_subdomain : null,
                baseVersion: params.base_version,
              )
              print("FAS preview published")
            }

            if (version.isStaging) {
              publish(
                src: target,
                appId: params.staging_app_id,
                repo: params.repo_id,
                sentryProjectName: params.sentry_project_name,
                variant: 'staging',
                baseVersion: params.base_version,
              )
              print("FAS staging published")
              slackMessages.add("- `${params.staging_app_id}`")
            }

            if (version.isProduction) {
              publish(
                src: target,
                appId: params.production_app_id,
                repo: params.repo_id,
                sentryProjectName: params.sentry_project_name,
                variant: 'production',
                baseVersion: params.base_version,
              )
              print("FAS production published")
              slackMessages.add("- `${params.production_app_id}`")
            }
          }
        }
      }
    }

    stageWithNotify("Publish to NPM", CONTEXTS.publishPackages) {
      container('bazel') {
        def publishPackages = sh(
          label: "Which packages were changed?",
          script: "bazel run //:has-changed -- -ref=${hasChangedRef} 'kind(package_info, //...)'",
          returnStdout: true
        )
        print(publishPackages)

        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
          if (publishPackages) {
            publishPackages.split('\n').each {
              container("bazel") {
                def jsonString = sh(
                  label: "Executes ${it} to retrieve package info",
                  script: "bazel run ${it}",
                  returnStdout: true
                )
                def packageInfo = readJSON text: jsonString
                int statusCode = sh(
                  label: "Check if ${packageInfo.target} is already pushed",
                  script: "bazel run ${packageInfo.target}:is_published",
                  returnStatus: true
                )
                if (statusCode != 0) {
                  if (isPullRequest) {
                    packageNameTag = sh(
                      label: "Publish ${packageInfo.name} package",
                      script: "bazel run ${packageInfo.target}:npm-package.pack",
                      returnStdout: true
                    ).trim()
                    print("Dry run package $packageNameTag")
                  } else {
                    packageNameTag = sh(
                      label: "Publish ${packageInfo.name} package",
                      script: "bazel run ${packageInfo.target}:npm-package.publish",
                      returnStdout: true
                    ).trim()
                    print("Pushed package $packageNameTag")

                    slackMessages.add("- `${packageNameTag}`")
                  }
                }
              }
            }
          }
        }
      }
    }

    if (isProduction) {
      stageWithNotify("Spinnaker deployments", CONTEXTS.spinnaker_deployments) {
        container('bazel') {
          def getReleases = sh(
            label: "Prepare docker builds",
            script: "bazel query \"attr(name, 'prepare_docker_build\$', //apps/...)\"",
            returnStdout: true
          )
          if (getReleases) {
            getReleases.split('\n').each {
              sh(
                label: "Run docker build",
                script: "bazel build ${it}",
              )
            }
          }
          def changedApps = sh(
            label: "Which apps were changed?",
            script: "bazel run //:has-changed -- -ref=${hasChangedRef} 'kind(spinnaker_deployment, //...)'",
            returnStdout: true
          )
          print(changedApps)
          if (changedApps) {
            changedApps.split('\n').each {
              def target = it.split(':')[0]
              def environment = it.split('spinnaker_deployment_')[1]
              def nameTag = sh(
                label: "Push ${target} Docker image",
                script: "bazel --bazelrc=.ci.bazelrc run ${target}:push_${environment} 2>&1 | grep 'Successfully pushed Docker image to' | awk '{ print \$NF }'",
                returnStdout: true
              ).trim()
              print("Pushed Docker image $nameTag")

              def jsonString = sh(script: "bazel run ${it}", returnStdout: true)
              print(jsonString)
              // JSON object is on the last line
              def params = readJSON text: jsonString.split('\n').last()
              print(params)
              params.pipelines.each({ pipeline ->
                print("Spinnaker deploy ${params.name} ${pipeline} ${nameTag}")
                spinnaker.deploy(params.name, pipeline, nameTag ? [nameTag] : [])
              })

              slackMessages.add("- `${params.name}` (<https://spinnaker.cognite.ai/#/applications/${params.name}/executions|pipeline>)")
            }
          }
        }
      }
    }

    if (isProduction) {
      stageWithNotify("Spinnaker pipelines", CONTEXTS.spinnaker_pipeline) {
        container('bazel') {
          def changedApps = sh(label: "Which spinnaker apps were changed?", script: "bazel run //:has-changed -- -ref=HEAD^1 'kind(spinnaker_pipeline, //...)'", returnStdout: true)
          print(changedApps)
          if (changedApps) {
            def tobeDeployedApp = []
            changedApps.split('\n').each {
              def file = sh(script: "bazel run ${it}", returnStdout: true)
              print(file)
              tobeDeployedApp.add(file)
            }
            deploySpinnakerPipelineConfigs.upload(
              tobeDeployedApp: tobeDeployedApp // ['spinnaker-config/<app>/app-config.yaml']
            )
          }
        }
      }
    }

    if (!slackMessages.isEmpty()) {
      slack.send(
        channel: '#frontend-firehose',
        message: """:tada: New application deployments :tada:
${slackMessages.join('\n')}
"""
      )
    }
  }
}
