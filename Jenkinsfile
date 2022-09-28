@Library('jenkins-helpers') _

static final String APP_ID = 'cdf-flows'
static final String APPLICATION_REPO_ID = 'cdf-ui-flows'
static final String NODE_VERSION = 'node:14'
static final String VERSIONING_STRATEGY = 'single-branch'

def pods = { body ->
  yarn.pod(nodeVersion: NODE_VERSION) {
    previewServer.pod(nodeVersion: NODE_VERSION) {
      locizeApiKey = secretEnvVar(
        key: 'LOCIZE_API_KEY',
        secretName: 'fusion-locize-api-key',
        secretKey: 'FUSION_LOCIZE_API_KEY'
      )
      fas.pod(
        nodeVersion: NODE_VERSION,
        envVars: [
          locizeApiKey,
        ]
      ) {
        // This enables codecov for the repo. If this fails to start, then
        // do the following:
        //  1. Obtain a token by going to:
        //     https://codecov.io/gh/cognitedata/YOUR-REPO-HERE
        //  2. Create a PR similar to:
        //     https://github.com/cognitedata/terraform/pull/1923
        //  3. Get that PR approved, applied, and merged
        //
        // If you don't want codecoverage, then you can just remove this.
        testcafe.pod() {
          podTemplate(
            containers: [
              containerTemplate(
                name: 'cloudsdk',
                image: 'google/cloud-sdk:277.0.0',
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
            properties([

            ])
            node(POD_LABEL) {
              body()
            }
          }
        }
      }
    }
  }
}

pods {
  def gitCommit
  def gitAuthor
  def getTitle
  def isPullRequest = !!env.CHANGE_ID
  def isRelease = env.BRANCH_NAME == 'master'


  def context_install = "continuous-integration/jenkins/install"
  static final Map<String, Boolean> version = versioning.getEnv(
    versioningStrategy: VERSIONING_STRATEGY
  )

  dir('main') {
    stage("Checkout code") {
      checkout(scm)
      gitCommit = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
      gitTitle = sh(returnStdout: true, script: "git show -s --format='%s' HEAD").trim()
      gitAuthor = sh(returnStdout: true, script: "git show -s --format='%ae' HEAD").trim()
    }

    githubNotifyWrapper(context_install) {
        stage('Install dependencies') {
            yarn.setup()
        }
    }

    parallel(
      'Lint': {
        container('fas') {
          stageWithNotify('Lint') {
            sh("yarn lint")
          }
        }
      },
      'Test': {
        container('fas') {
          stageWithNotify('Unit tests') {
            sh("yarn test")
          }
        }
      },
      'Preview': {
        if(!isPullRequest) {
          print "No PR previews for release builds"
          return;
        }
        container('fas') {
          stageWithNotify('Build and deploy PR') {
            def package_name = "@cognite/cdf-flows";
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

    if (isRelease) {
      stageWithNotify('Deploy to FAS') {
        fas.publish(
          shouldPublishSourceMap: false
        )
      }
    }
  }
}

