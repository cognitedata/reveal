@Library('jenkins-helpers') _

//  Staging deployments are protected by CogniteIAP, meaning they're only accessible to Cogniters.
static final String STAGING_APP_ID = "cognuit-dev"
static final String PRODUCTION_APP_ID = "cognuit"
static final String APPLICATION_REPO_ID = "cognuit"

static final String SENTRY_DSN = "https://19bbb6bf3192415b98a42ed236cf4321@o124058.ingest.sentry.io/5599787"

// Specify your locize.io project ID. If you do not have one of these, please
// stop by #frontend to get a project created under the Cognite umbrella.
// See https://cog.link/i18n for more information.
static final String LOCIZE_PROJECT_ID = "7533b714-9df3-48c3-9a04-1d9ee1a0fa3a"

static final String PR_COMMENT_MARKER = "[pr-server]\n"

static final String NODE_VERSION = 'node:12'

def pods = { body ->
  yarn.pod(nodeVersion: NODE_VERSION) {
    previewServer.pod(nodeVersion: NODE_VERSION) {
      fas.pod(
        nodeVersion: NODE_VERSION,
        sentryProjectName: SENTRY_PROJECT_NAME,
        sentryDsn: SENTRY_DSN,
        locizeProjectId: LOCIZE_PROJECT_ID
      ) {
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

pods {
  def gitCommit
  def contexts = [
    checkout: "continuous-integration/jenkins/checkout",
    setup: "continuous-integration/jenkins/setup",
    lint: "continuous-integration/jenkins/lint",
    unitTests: "continuous-integration/jenkins/unit-tests",
    preview: "continuous-integration/jenkins/preview",
    storybook: "continuous-integration/jenkins/storybook",
    buildRelease: "continuous-integration/jenkins/build-release",
    publishRelease: "continuous-integration/jenkins/publish-release",
  ]

  def isStaging = env.BRANCH_NAME == "master"
  def isRelease = env.BRANCH_NAME.startsWith("release-")
  def isPullRequest = !!env.CHANGE_ID

  stageWithNotify('Checkout code', contexts.checkout) {
    checkout(scm)
  }

  stageWithNotify('Install dependencies', contexts.setup) {
    yarn.setup()
  }

  parallel(
    'Lint': {
      stageWithNotify('Check linting', contexts.lint) {
        container('fas') {
          sh('yarn lint')
        }
      }
    },
    'Unit tests': {
      stageWithNotify('Execute unit tests', contexts.unitTests) {
        container('fas') {
          sh('yarn test')
        }
      }
    },
    'Preview': {
      stageWithNotify('Preview', contexts.preview) {
        if (!isPullRequest) {
          print "No PR previews for release builds"
          return
        }
        previewServer(
          buildCommand: 'yarn build',
          commentPrefix: PR_COMMENT_MARKER,
          buildFolder: 'build',
          prefix: 'pr',
        )
      }
    },
    'Release': {
      stageWithNotify('Build for release', contexts.buildRelease) {
        if (isPullRequest) {
          print "No release builds for PRs"
          return
        }

        def appId = isStaging ? STAGING_APP_ID : PRODUCTION_APP_ID

        fas.build(
          appId: appId,
          repo: APPLICATION_REPO_ID,
          buildCommand: 'yarn build',
        )
      }
    }
  )

  if (!isPullRequest) {
    stageWithNotify('Publish build', contexts.publishRelease) {
      fas.publish()
    }
  }
}
