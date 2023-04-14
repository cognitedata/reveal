@Library('jenkins-helpers') _

static final String NODE_VESION = 'node:16'
static final String VERSIONING_STRATEGY = "single-branch"

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
            image: 'google/cloud-sdk:421.0.0',
            ttyEnabled: true,
          )],
        envVars: [
          envVar(key: 'CHANGE_ID', value: env.CHANGE_ID),
        ],
        volumes: [
          secretVolume(secretName: 'npm-credentials',
                       mountPath: '/npm-credentials',
                       defaultMode: '400')
        ]) {
        node(POD_LABEL) {
          body()
        }
      }
    }
  }
}

pods {
  def isPullRequest = !!env.CHANGE_ID
  def isRelease = env.BRANCH_NAME == 'master';
  def context_install = "continuous-integration/jenkins/install"

  static final Map<String, Boolean> version = versioning.getEnv(
    versioningStrategy: VERSIONING_STRATEGY
  )

  dir('main') {
    stage("Checkout code") {
      checkout(scm)
    }
  
    githubNotifyWrapper(context_install) {
        stage('Install dependencies') {
        yarn.setup()
      }
    }

    stage("Git config") {
        sh("git config --global --add safe.directory ${env.WORKSPACE}/main")
    }

    parallel(
      'Preview': {
        if(!isPullRequest) {
          print "No PR previews for release builds"
          return;
        }
        stageWithNotify('Build and deploy PR') {
        def package_name = "@cognite/cdf-extractor-downloads";
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
      },
      'Build': {
        if (isPullRequest) {
          println "Skipping build for pull requests"
          return
        }
        stageWithNotify('Build for FAS') {
          fas.build(
            appId: APP_ID,
            repo: APPLICATION_REPO_ID,
            buildCommand: 'yarn build',
            shouldPublishSourceMap: false
          )
        }   
      }
    )

    if (isRelease) {
      container('fas') {
        stageWithNotify('Save missing keys to locize') {
          sh("yarn save-missing")
        }
        stageWithNotify('Remove deleted keys from locize') {
          sh("yarn remove-deleted")
        }
      }
    }
  }
}

