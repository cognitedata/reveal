@Library('jenkins-helpers') _

//  Staging deployments are protected by CogniteIAP, meaning they're only accessible to Cogniters.
static final String STAGING_DOMAIN_NAME = "staging.cwp.cogniteapp.com"
// We do not have a production app yet
static final String RELEASE_DOMAIN_NAME = ""


// Replace this with your app's ID on https://sentry.io/ -- if you do not have
// one (or do not have access to Sentry), stop by #frontend to ask for help. :)
static final String SENTRY_PROJECT_NAME = ""
// The Sentry DSN is the URL used to report issues into Sentry. This can be
// found on your Sentry's project page, or by going here:
// https://docs.sentry.io/error-reporting/quickstart/?platform=browser
//
// If you omit this, then client errors WILL NOT BE REPORTED.
static final String SENTRY_DSN = ""

// Specify your locize.io project ID. If you do not have one of these, please
// stop by #frontend to get a project created under the Cognite umbrella.
// See https://cog.link/i18n for more information.
static final String LOCIZE_PROJECT_ID = ""

static final String PR_COMMENT_MARKER = "[pr-server]\n"
static final String STORYBOOK_COMMENT_MARKER = "[storybook-server]\n"

static final String NODE_VERSION = 'node:12'

def pods = { body ->
  yarn.pod(nodeVersion: NODE_VERSION) {
    previewServer.pod(nodeVersion: NODE_VERSION) {
      fas.pod(
        nodeVersion: NODE_VERSION
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

        def domainName = isStaging ? STAGING_DOMAIN_NAME : RELEASE_DOMAIN_NAME

        fas.build(
          useContainer: true,
          domainName: domainName,
          iap: isStaging,
          buildCommand: 'yarn build',
        )
      }
    }
  )

  if (!isPullRequest) {
    stageWithNotify('Publish build', contexts.publishRelease) {
      fas.publish(
        useContainer: true,
      )
    }
  }
}
