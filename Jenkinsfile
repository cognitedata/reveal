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
static final String LOCIZE_PROJECT_ID = '1610fa5f-c8df-4aa8-9049-c08d8055d8ac'

// Specify your Mixpanel project token. If you do not have one of these, please
// stop by #frontend to get a project created under the Cognite umbrella.
// Remember: if you can't measure it, you can't improve it!
static final String MIXPANEL_TOKEN = '0837d632cca24291a0a1025d488d1a9a' // pragma: allowlist secret

// Specify your projects alerting slack channel here. If you do not have one of these, please
// consider creating one for your projects alerts
static final String SLACK_CHANNEL = 'devflow-charts'

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
static final String VERSIONING_STRATEGY = 'multi-branch'
environment = versioning.getEnv(versioningStrategy: VERSIONING_STRATEGY)
// == End of customization. Everything below here is common. == \\

static final String NODE_VERSION = 'node:12'

static final Map<String, String> CONTEXTS = [
  checkout: 'continuous-integration/jenkins/checkout',
  setup: 'continuous-integration/jenkins/setup',
  lint: 'continuous-integration/jenkins/lint',
  unitTests: 'continuous-integration/jenkins/unit-tests',
  buildStaging: 'continuous-integration/jenkins/build-staging',
  publishStaging: 'continuous-integration/jenkins/publish-staging',
  buildProduction: 'continuous-integration/jenkins/build-production',
  publishProduction: 'continuous-integration/jenkins/publish-production',
  buildPreview: 'continuous-integration/jenkins/build-preview',
  publishPreview: 'continuous-integration/jenkins/publish-preview',
]

// Copy these before installing dependencies so that we don't have to
// copy the entire node_modules directory tree as well.
static final String[] DIRS = [
  'lint',
  'unit-tests',
  'preview',
  'staging',
  'production',
]

def pods = { body ->
  yarn.pod(nodeVersion: NODE_VERSION) {
    previewServer.pod(nodeVersion: NODE_VERSION) {
      locizeApiKey = secretEnvVar(
        key: 'REACT_APP_LOCIZE_API_KEY',
        secretName: 'charts-frontend',
        secretKey: 'CHARTS_LOCIZE_API_KEY',
        optional: !environment.isPullRequest
      )
      fas.pod(
        nodeVersion: NODE_VERSION,
        sentryProjectName: SENTRY_PROJECT_NAME,
        sentryDsn: SENTRY_DSN,
        locizeProjectId: LOCIZE_PROJECT_ID,
        mixpanelToken: MIXPANEL_TOKEN,
        envVars: [locizeApiKey]
      ) {
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
      ],
      workers: 3,
    )

    stageWithNotify('Publish preview build', CONTEXTS.publishPreview) {
      if (!isPullRequest) {
        print 'Not a PR, no need to preview'
        return
      }
      dir('preview') {
        fas.publish(
          previewSubdomain: 'charts'
        )
      }
    }

    stageWithNotify('Publish staging build', CONTEXTS.publishStaging) {
      if (!isStaging) {
        print 'Not pushing to staging, no need to preview'
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
      if (VERSIONING_STRATEGY != 'single-branch') {
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
