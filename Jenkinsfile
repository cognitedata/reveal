@Library('jenkins-helpers') _

// This is your FAS staging app id. Staging deployments are protected by Cognite
// IAP, meaning they're only accessible to Cogniters.
static final String STAGING_APP_ID = 'charts-dev'

// This is your FAS production app id.
// At this time, there is no production build for the demo app.
static final String PRODUCTION_APP_ID = 'charts'

// This is your FAS app identifier (repo) shared across both production and staging apps
// in order to do a commit lookup (commits are shared between apps).
static final String APPLICATION_REPO_ID = 'cognite-charts'

// Replace this with your app's ID on https://sentry.io/ -- if you do not have
// one (or do not have access to Sentry), stop by #frontend to ask for help. :)
static final String SENTRY_PROJECT_NAME = 'cognite-charts'

// The Sentry DSN is the URL used to report issues into Sentry. This can be
// found on your Sentry's project page, or by going here:
// https://docs.sentry.io/error-reporting/quickstart/?platform=browser
//
// If you omit this, then client errors WILL NOT BE REPORTED.
static final String SENTRY_DSN = 'https://b35f7e3635d34e44bd24a354dfc4f13a@o124058.ingest.sentry.io/5509609'

// Specify your locize.io project ID. If you do not have one of these, please
// stop by #frontend to get a project created under the Cognite umbrella.
// See https://cog.link/i18n for more information.
//
// Note: You'll probably want to set this in scripts/start.sh too
static final String LOCIZE_PROJECT_ID = ''

// Specify your Mixpanel project token. If you do not have one of these, please
// stop by #frontend to get a project created under the Cognite umbrella.
// Remember: if you can't measure it, you can't improve it!
static final String MIXPANEL_TOKEN = ''

// Specify your projects alerting slack channel here. If you do not have one of these, please
// consider creating one for your projects alerts
static final String SLACK_CHANNEL = 'cognite-charts'

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
static final String VERSIONING_STRATEGY = "multi-branch"

// == End of customization. Everything below here is common. == \\

static final String NODE_VERSION = 'node:12'

static final Map<String, String> CONTEXTS = [
  checkout: "continuous-integration/jenkins/checkout",
  setup: "continuous-integration/jenkins/setup",
  lint: "continuous-integration/jenkins/lint",
  unitTests: "continuous-integration/jenkins/unit-tests",
  buildStaging: "continuous-integration/jenkins/build-staging",
  publishStaging: "continuous-integration/jenkins/publish-staging",
  buildProduction: "continuous-integration/jenkins/build-production",
  publishProduction: "continuous-integration/jenkins/publish-production",
  buildPreview: "continuous-integration/jenkins/build-preview",
  publishPreview: "continuous-integration/jenkins/publish-preview",
]

// Copy these before installing dependencies so that we don't have to
// copy the entire node_modules directory tree as well.
static final String[] DIRS = [
  'lint',
  'testcafe',
  'unit-tests',
  'storybook',
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
        locizeProjectId: LOCIZE_PROJECT_ID,
        mixpanelToken: MIXPANEL_TOKEN,
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
        // codecov.pod {
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
        // } Code cov
      }
    }
  }
}

pods {
  static final Map<String, Boolean> version = versioning.getEnv(
    versioningStrategy: VERSIONING_STRATEGY
  )
  final boolean isStaging = version.isStaging
  final boolean isProduction = version.isProduction
  final boolean isPullRequest = version.isPullRequest

  app.safeRun(
    slackChannel: SLACK_CHANNEL,
    logErrors: isStaging || isProduction
  ) {
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
                stage("Upload coverage reports") {
                  codecov.uploadCoverageReport()
                }
              }
            }
          }
        },

        'Storybook': {
          previewServer.runStorybookStage(
            shouldExecute: isPullRequest
          )
        },

        'Preview': {
          dir('preview') {
            stageWithNotify('Build for preview', CONTEXTS.buildPreview) {
              fas.build(
                appId: "${STAGING_APP_ID}-pr-${env.CHANGE_ID}",
                repo: APPLICATION_REPO_ID,
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

        'E2e': {
          testcafe.runE2EStage(
            //
            // multi-branch mode:
            //
            // We don't need to run end-to-end tests against release because
            // we're in one of two states:
            //   1. Cutting a new release
            //      In this state, staging has e2e already passing.
            //   2. Cherry-picking in a hotfix
            //      In this state, the PR couldn't have been merged without
            //      passing end-to-end tests.
            // As such, we can skip end-to-end tests on release branches. As
            // a side-effect, this will make hotfixes hit production faster!
            shouldExecute: !isRelease,

            //
            // single-branch mode:
            //
            // shouldExecute: true,

            // buildCommand: 'yarn testcafe:build',
            // runCommand: 'yarn testcafe:start'
          )
        },
      ],
      workers: 3,
    )

    if (isPullRequest) {
      stageWithNotify('Publish preview build', CONTEXTS.publishPreview) {
        dir('preview') {
          fas.publish(
            previewSubdomain: 'charts'
          )
        }
      }
    }

    if (isStaging && STAGING_APP_ID) {
      stageWithNotify('Publish staging build', CONTEXTS.publishStaging) {
        dir('staging') {
          fas.publish()

        }

        // in 'single-branch' mode we always publish 'staging' and 'master' builds
        // from the main branch, but we only need to notify about one of them.
        // so it is ok to skip this message in that case
        //
        // note: the actual deployment of each is determined by versionSpec in FAS
        if (VERSIONING_STRATEGY != "single-branch") {
          dir('main') {
            slack.send(
              channel: SLACK_CHANNEL,
                message: "Deployment of ${env.BRANCH_NAME} complete!"
            )
          }
        }
      }
    }

    if (isProduction && PRODUCTION_APP_ID) {
      stageWithNotify('Publish production build', CONTEXTS.publishProduction) {
        dir('production') {
          fas.publish()

        }

        dir('main') {
          slack.send(
            channel: SLACK_CHANNEL,
            message: "Deployment of ${env.BRANCH_NAME} complete!"
          )
        }
      }
    }
  }
}
