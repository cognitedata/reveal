@Library('jenkins-helpers') _

static final String PR_COMMENT_MARKER = "🚀[pr-server]\n"
static final String STORYBOOK_COMMENT_MARKER = "📖[storybook-server]\n"
static final String SLACK_ALERTS_CHANNEL = "#cdf-ui-devs-alerts"
static final String FIREBASE_APP_SITE = 'document-search'
static final String NODE_VERSION = 'node:14'
static final String VERSIONING_STRATEGY = "single-branch"
static final String SENTRY_PROJECT_NAME = "watchtower"
static final String SENTRY_DSN = "https://d09f6d3557114e6cbaa63b56d7ef86cc@o124058.ingest.sentry.io/1288725"
static final String LOCIZE_PROJECT_ID = "0774e318-387b-4e68-94cc-7b270321bbf1" // not used


def pods = { body ->
  yarn.pod(nodeVersion: NODE_VERSION) {
    previewServer.pod(nodeVersion: NODE_VERSION) {
      appHosting.pod(
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

pods {
  def gitCommit
  def gitAuthor
  def getTitle
  def isRelease = env.BRANCH_NAME == 'master' || env.BRANCH_NAME.startsWith('release-')
  def projectProduction = "cognitedata-production"

  def context_checkout = "continuous-integration/jenkins/checkout"
    def context_install = "continuous-integration/jenkins/install"
    def context_setup = "continuous-integration/jenkins/setup"
    def context_lint = "continuous-integration/jenkins/lint"
    def context_test = "continuous-integration/jenkins/test"
    def context_unitTests = "continuous-integration/jenkins/unit-tests"
    def context_buildPrPreview = "continuous-integration/jenkins/build-pr-preview"
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
          container('apphosting') {
            stageWithNotify('Lint') {
              sh("yarn lint")
            }
          }
        },
        'Test': {
          container('apphosting') {
            stageWithNotify('Unit tests') {
              sh("yarn test")
            }
          }
        },
        'Preview': {
          if (isRelease) {
            print "No PR previews for release builds"
            return;
          }
          stageWithNotify('Build and deploy') {
            previewServer(
              buildCommand: 'yarn build:preview',
              prefix: 'pr',
              buildFolder: 'build',
              commentPrefix: PR_COMMENT_MARKER
            )
          }
        },
        'Build': {
          if (!isRelease) {
            print "No builds for prs"
            return;
          }
          stageWithNotify('Build and deploy') {
            appHosting(
              appName: FIREBASE_APP_SITE,
              environment: 'production',
              firebaseJson: 'firebase.json',
              buildCommand: 'yarn build',
              buildFolder: 'build'
            )
          }
        }
      ],
      workers: 2,
    )
  }
}
