@Library('jenkins-helpers') _

// This is your FAS staging app id. Staging deployments are protected by Cognite
// IAP, meaning they're only accessible to Cogniters.
static final String STAGING_APP_ID = "digital-cockpit-staging"

// This is your FAS production app id.
// A this time, there is no production build for the demo app.
static final String PRODUCTION_APP_ID = "digital-cockpit"

// This is your FAS app identifier (repo) shared across both production and staging apps
// in order to do a commit lookup (commits are shared between apps).
static final String APPLICATION_REPO_ID = "digital-cockpit"

// Replace this with your app's ID on https://sentry.io/ -- if you do not have
// one (or do not have access to Sentry), stop by #frontend to ask for help. :)
static final String SENTRY_PROJECT_NAME = "digital-cockpit"

// The Sentry DSN is the URL used to report issues into Sentry. This can be
// found on your Sentry's project page, or by going here:
// https://docs.sentry.io/error-reporting/quickstart/?platform=browser
//
// If you omit this, then client errors WILL NOT BE REPORTED.
static final String SENTRY_DSN = ""

// Specify your Mixpanel project token. If you do not have one of these, please
// stop by #frontend to get a project created under the Cognite umbrella.
// Remember: if you can't measure it, you can't improve it!
static final String MIXPANEL_TOKEN = ""

// This determines how this app is versioned. See https://cog.link/releases for
// more information. The options available here are:
//
//  - single-branch
//    This will push every change on the master branch first to the staging
//    environment and then to the production environment. The product team can
//    use FAS to control which version is actually served to end users who visit
//    the production environment.
//
//  - multi-branch
//    This will push every change on the master branch to the staging
//    environment. Pushing to the production environment will happen on branches
//    which are named release-[NNN].
//
// No other options are supported at this time.
static final String VERSIONING_STRATEGY = "single-branch"

// == End of customization. Everything below here is common. == \\

static final String NODE_VERSION = 'node:12'

static final Map<String, String> CONTEXTS = [
  checkout: "continuous-integration/jenkins/checkout",
  setup: "continuous-integration/jenkins/setup",
  lint: "continuous-integration/jenkins/lint",
  unitTests: "continuous-integration/jenkins/unit-tests",
  e2eTests: "continuous-integration/jenkins/e2e-tests",
  preview: "continuous-integration/jenkins/preview",
  buildStaging: "continuous-integration/jenkins/build-staging",
  publishStaging: "continuous-integration/jenkins/publish-staging",
  buildProduction: "continuous-integration/jenkins/build-production",
  publishProduction: "continuous-integration/jenkins/publish-production",
]

// Copy these before installing dependencies so that we don't have to
// copy the entire node_modules directory tree as well.
static final String[] DIRS = [
  'lint',
  'testcafe',
  'unit-tests',
  'preview',
  'staging',
  'production',
]

def pods = { body ->
  yarn.pod(nodeVersion: NODE_VERSION) {
    previewServer.pod(nodeVersion: NODE_VERSION) {
      fas.pod(
        nodeVersion: NODE_VERSION,
        sentryProjectName: SENTRY_PROJECT_NAME,
        sentryDsn: SENTRY_DSN,
        mixpanelToken: MIXPANEL_TOKEN,
      ) {
        testcafe.pod() {
          properties([
            buildDiscarder(logRotator(daysToKeepStr: '30', numToKeepStr: '20'))
          ])
          node(POD_LABEL) {

            dir('main') {
              stageWithNotify('Checkout code', CONTEXTS.checkout) {
                checkout(scm)
              }

              stageWithNotify('Install dependencies', CONTEXTS.setup) {
                yarn.setup()
              }

              yarn.copy(
                dirs: DIRS
              )
            }

            body()
          }
        }
      }
    }
  }
}

pods {
  static final Map<String, Boolean> env = versioning.getEnv(
    versioningStrategy: VERSIONING_STRATEGY
  )
  final boolean isStaging = env.isStaging
  final boolean isProduction = env.isProduction
  final boolean isPullRequest = env.isPullRequest

  threadPool(
    tasks: [
      'Lint': {
        stageWithNotify('Check linting', CONTEXTS.lint) {
          dir('lint') {
            container('fas') {
              sh('yarn lint')
            }
          }
        }
      },

      'Unit tests': {
        stageWithNotify('Execute unit tests', CONTEXTS.unitTests) {
          dir('unit-tests') {
            container('fas') {
              sh('yarn test')
              junit(allowEmptyResults: true, testResults: '**/junit.xml')
              if (isPullRequest) {
                summarizeTestResults()
              }
            }
          }
        }
      },

      'Preview': {
        dir('preview') {
          stageWithNotify('Preview', CONTEXTS.preview) {
            previewServer(
              buildCommand: 'yarn build preview',
              shouldExecute: isPullRequest
            )
          }
        }
      },

      'Staging': {
        dir('staging') {
          stageWithNotify('Build for staging', CONTEXTS.buildStaging) {
            fas.build(
              appId: STAGING_APP_ID,
              repo: APPLICATION_REPO_ID,
              buildCommand: 'yarn build staging',
              shouldExecute: isStaging
            )
          }
        }
      },

      'Production': {
        dir('production') {
          stageWithNotify('Build for production', CONTEXTS.buildProduction) {
            fas.build(
              appId: PRODUCTION_APP_ID,
              repo: APPLICATION_REPO_ID,
              buildCommand: 'yarn build production',
              shouldExecute: isProduction
            )
          }
        }
      },

      // TODO disabled temporary since not used yet
      // 'E2e': {
      //   stageWithNotify('Execute e2e tests', CONTEXTS.e2eTests) {
      //     dir('testcafe') {
      //       container('fas') {
      //         sh('yarn testcafe:build')
      //       }
      //       container('testcafe') {
      //         testcafe.runTests(
      //           runCommand: 'yarn testcafe:start'
      //         )
      //       }
      //     }
      //   }
      // },
    ],
    workers: 3,
  )

  if (isStaging && STAGING_APP_ID) {
    stageWithNotify('Publish staging build', CONTEXTS.publishStaging) {
      dir('staging') {
        fas.publish()
      }
    }
  }

  if (isProduction && PRODUCTION_APP_ID) {
    stageWithNotify('Publish production build', CONTEXTS.publishProduction) {
      dir('production') {
        fas.publish()
      }
    }
  }
}
