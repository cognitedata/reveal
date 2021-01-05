@Library('jenkins-helpers') _

static final String PR_COMMENT_MARKER = "🚀[pr-server]\n"
static final String STORYBOOK_COMMENT_MARKER = "📖[storybook-server]\n"
static final String SLACK_ALERTS_CHANNEL = "#cdf-ui-devs-alerts"
// deploySpinnakerPipelineConfigs {}
static final String APP_ID = 'cdf-data-exploration'
static final String APPLICATION_REPO_ID = 'data-exploration'
static final String NODE_VERSION = 'node:12'
static final String VERSIONING_STRATEGY = "single-branch"
static final String SENTRY_PROJECT_NAME = "watchtower"
static final String SENTRY_DSN = "https://d09f6d3557114e6cbaa63b56d7ef86cc@o124058.ingest.sentry.io/1288725"
static final String LOCIZE_PROJECT_ID = "0774e318-387b-4e68-94cc-7b270321bbf1" // not used


def pods = { body ->
  yarn.pod(nodeVersion: NODE_VERSION) {
    previewServer.pod(nodeVersion: NODE_VERSION) {
      fas.pod(
        nodeVersion: NODE_VERSION,
        sentryProjectName: SENTRY_PROJECT_NAME,
        sentryDsn: SENTRY_DSN,
        locizeProjectId: LOCIZE_PROJECT_ID
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
              buildDiscarder(logRotator(daysToKeepStr: '30', numToKeepStr: '20'))
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
  def bucketBundles = "cdf-hub-bundles"
  def projectProduction = "cognitedata-production"

  def context_checkout = "continuous-integration/jenkins/checkout"
    def context_install = "continuous-integration/jenkins/install"
    def context_setup = "continuous-integration/jenkins/setup"
    def context_lint = "continuous-integration/jenkins/lint"
    def context_test = "continuous-integration/jenkins/test"
    def context_unitTests = "continuous-integration/jenkins/unit-tests"
    def context_buildPrPreview = "continuous-integration/jenkins/build-pr-preview"
    def context_build_fas = "continuous-integration/jenkins/build-fas"
    def context_build = "continuous-integration/jenkins/build"
    def context_deploy_app = "continuous-integration/jenkins/deploy-app"
    def context_publishRelease = "continuous-integration/jenkins/publish-release"
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

    threadPool(
      tasks: [
        'Lint': {
          container('fas') {
            stageWithNotify('Lint') {
              sh("yarn ci")
            }
          }
        },
        'Test': {
          container('fas') {
            stageWithNotify('Unit tests') {
              sh("./bin/ci-run-unittest.sh test")
            }
          }
        },
        'Preview': {
          if(!isPullRequest) {
            print "No PR previews for release builds"
            return;
          }
          stageWithNotify('Build and deploy PR') {
            previewServer(
              buildCommand: 'yarn build:preview',
              prefix: 'pr',
              buildFolder: 'build',
              commentPrefix: PR_COMMENT_MARKER
            )
          }
        },
        'Storybook': {
          if(!isPullRequest) {
            print "No PR previews for release builds"
            return;
          }
          stageWithNotify('Build and deploy Storybook') {
            previewServer(
              buildCommand: 'yarn build-storybook',
              prefix: 'storybook',
              buildFolder: 'storybook-static',
              commentPrefix: STORYBOOK_COMMENT_MARKER
            )
          }
        },
        'Build': {
          if(isPullRequest) {
            print "No builds for prs"
            return;
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
      ],
      workers: 2,
    )

    if (isRelease) {
      stageWithNotify('Deploy to FAS') {
        fas.publish(
          shouldPublishSourceMap: false
        )
      }
    } else {
      stageWithNotify('Build the explorer library') {
        container('fas') {
          sh("yarn build-lib")
        }
      }
    }
  }
}
