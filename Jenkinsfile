@Library('jenkins-helpers') _

static final String APP_ID = 'cdf-ui-entity-matching'
static final String APPLICATION_REPO_ID = 'cdf-ui-entity-matching-2'
static final String NODE_VERSION = 'node:18'
static final String VERSIONING_STRATEGY = 'single-branch'

def pods = { body ->
  yarn.pod(nodeVersion: NODE_VERSION) {
    previewServer.pod(nodeVersion: NODE_VERSION) {
      locizeApiKey = secretEnvVar(
        key: 'LOCIZE_API_KEY',
        secretName: 'fusion-locize-api-key',
        secretKey: 'FUSION_LOCIZE_API_KEY'
      )
      podTemplate(
        containers: [
          containerTemplate(
            name: 'cloudsdk',
            image: 'google/cloud-sdk:423.0.0',
            resourceRequestCpu: '500m',
            resourceRequestMemory: '500Mi',
            resourceLimitCpu: '500m',
            resourceLimitMemory: '500Mi',
            ttyEnabled: true,
            envVars: [
              envVar(key: 'GOOGLE_APPLICATION_CREDENTIALS', value: '/jenkins-cdf-hub-deployer/credentials.json'),
            ]
        )],
        envVars: [
          envVar(key: 'CHANGE_ID', value: env.CHANGE_ID),
        ],
        volumes: [
          secretVolume(secretName: 'npm-credentials',
                        mountPath: '/npm-credentials',
                        defaultMode: '400'),
          secretVolume(secretName: 'jenkins-cdf-hub-deployer',
                        mountPath: '/jenkins-cdf-hub-deployer',
                        readOnly: true),
          hostPathVolume(hostPath: '/var/run/docker.sock', mountPath: '/var/run/docker.sock')
        ]) {
        properties([])
        node(POD_LABEL) {
          body()
        }
      }
    }
  }
}

pods {
  def isPullRequest = !!env.CHANGE_ID
  def isRelease = env.BRANCH_NAME == 'master'

  if (!isPullRequest) {
    print "No PR previews for release builds"
    return;
  }

  dir('main') {
    stage("Checkout code") {
      checkout(scm)
      gitCommit = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
      gitTitle = sh(returnStdout: true, script: "git show -s --format='%s' HEAD").trim()
      gitAuthor = sh(returnStdout: true, script: "git show -s --format='%ae' HEAD").trim()
    }

    stage('Install dependencies') {
      yarn.setup()
    }

    stage('Preview') {
      container('fas') {
        stageWithNotify('Build and deploy PR') {
          def package_name = "@cognite/cdf-ui-entity-matching";
          def prefix = jenkinsHelpersUtil.determineRepoName();
          def domain = "fusion-preview";
          previewServer(
            buildCommand: 'yarn build',
            buildFolder: 'build',
            prefix: prefix,
            repo: domain
          )
          deleteComments("[FUSION_PREVIEW_URL]")
          def url = "https://fusion-pr-preview.cogniteapp.com/?externalOverride=${package_name}&overrideUrl=https://${prefix}-${env.CHANGE_ID}.${domain}.preview.cogniteapp.com/index.js";
          pullRequest.comment("[FUSION_PREVIEW_URL] [$url]($url)");
        }
      }
    }
  }
}