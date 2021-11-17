@Library('jenkins-helpers') _

// This is your FAS staging app id. Staging deployments are protected by Cognite
// IAP, meaning they're only accessible to Cogniters.
static final String STAGING_APP_ID = 'platypus-staging'

// This is your FAS production app id.
// At this time, there is no production build for the demo app.
static final String PRODUCTION_APP_ID = 'platypus'

// This is your FAS app identifier (repo) shared across both production and staging apps
// in order to do a commit lookup (commits are shared between apps).
static final String APPLICATION_REPO_ID = 'platypus'

// Replace this with your app's ID on https://sentry.io/ -- if you do not have
// one (or do not have access to Sentry), stop by #frontend to ask for help. :)
static final String SENTRY_PROJECT_NAME = 'platypus'

// The Sentry DSN is the URL used to report issues into Sentry. This can be
// found on your Sentry's project page, or by going here:
// https://docs.sentry.io/error-reporting/quickstart/?platform=browser
//
// If you omit this, then client errors WILL NOT BE REPORTED.
static final String SENTRY_DSN = 'https://b37a75c7e26440009d63602ba2f02b9f@o124058.ingest.sentry.io/5996992'

// Specify your locize.io project ID. If you do not have one of these, please
// stop by #frontend to get a project created under the Cognite umbrella.
// See https://cog.link/i18n for more information.
//
// Note: You'll probably want to set this in scripts/start.sh too
static final String LOCIZE_PROJECT_ID = ''

// Specify your Mixpanel project token. If you do not have one of these, please
// stop by #frontend to get a project created under the Cognite umbrella.
// Remember: if you can't measure it, you can't improve it!
static final String MIXPANEL_TOKEN = 'c89f3ee3b5ea00b299a923a376f19637' // pragma: allowlist secret

// Specify your projects alerting slack channel here. If you do not have one of these, please
// consider creating one for your projects alerts
static final String SLACK_CHANNEL = 'alerts-platypus'

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
        codecov.pod {
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
}

pods {
  final boolean isStaging = env.BRANCH_NAME == 'master'
  final boolean isProduction = env.BRANCH_NAME.startsWith('release-')
  final boolean isPullRequest = !!env.CHANGE_ID
  app.safeRun(
    slackChannel: SLACK_CHANNEL,
    logErrors: isStaging || isProduction
  ) {
    threadPool(
      tasks: [
        'Lint': {
          stageWithNotify('Check linting', CONTEXTS.lint) {
            dir('lint') {
              retry(3) {
                container('fas') {
                  sh('yarn lint')
                }
              }
            }
          }
        },

        'Unit tests': {
          stageWithNotify('Execute unit tests', CONTEXTS.unitTests) {
            dir('unit-tests') {
              retry(3) {
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
          }
        },

        'Storybook': {
          retry(3) {
            previewServer.runStorybookStage(
              shouldExecute: isPullRequest
            )
          }
        },

        'Preview': {
          dir('preview') {
            stageWithNotify('Build for preview', CONTEXTS.buildPreview) {
              retry(3) {
                fas.build(
                  appId: "${STAGING_APP_ID}-pr-${env.CHANGE_ID}",
                  repo: APPLICATION_REPO_ID,
                  buildCommand: 'yarn build preview',
                  shouldExecute: isPullRequest,
                  sourceMapPath: ''
                )
              }
            }
          }
        },

        'Staging': {
          dir('staging') {
            stageWithNotify('Build for staging', CONTEXTS.buildStaging) {
              retry(3) {
                fas.build(
                  appId: STAGING_APP_ID,
                  repo: APPLICATION_REPO_ID,
                  buildCommand: 'yarn build staging',
                  shouldExecute: isStaging,
                  sourceMapPath: ''
                )
              }
            }
          }
        },

        'Production': {
            retry(3) {
              dir('production') {
                stageWithNotify('Build for production', CONTEXTS.buildProduction) {
                  fas.build(
                    appId: PRODUCTION_APP_ID,
                    repo: APPLICATION_REPO_ID,
                    buildCommand: 'yarn build production',
                    shouldExecute: isProduction,
                    sourceMapPath: ''
                  )
                }
              }
          }
        },

        // TBA
        // 'E2e': {
        //   testcafe.runE2EStage(
        //     shouldExecute: !isRelease,
        //     buildCommand: 'yarn testcafe:build',
        //     runCommand: 'yarn testcafe:start'
        //   )
        // },
      ],
      workers: 4,
    )

    stageWithNotify('Publish preview build', CONTEXTS.publishPreview) {
      if (!isPullRequest) {
        print "Not a PR, no need to preview"
        return
      }
      dir('preview') {
        fas.publish(
          previewSubdomain: 'platypus'
        )
      }
    }

    stageWithNotify('Publish staging build', CONTEXTS.publishStaging) {
      if (!isStaging) {
        print "Not pushing to staging, no need to preview"
        return
      }
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
