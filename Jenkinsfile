@Library('jenkins-helpers@fas-tools') _

// This is your staging domain. Staging deployments are protected by Cognite
// IAP, meaning they're only accessible to Cogniters.
static final String STAGING_DOMAIN_NAME =
    // This ternary is only in here to avoid accidentally publishing to the
    // wrong app once this template is used. You should remove this whole thing
    // and replace it with a static string.
    jenkinsHelpersUtil.determineRepoName() == 'react-demo-app'
      ? "react-demo.cognite.ai"
      : ""

// A this time, there is no production build for the demo app.
static final String PRODUCTION_DOMAIN_NAME =
    // This ternary is only in here to avoid accidentally publishing to the
    // wrong app once this template is used. You should remove this whole thing
    // and replace it with a static string.
    jenkinsHelpersUtil.determineRepoName() == 'react-demo-app'
      ? "react-demo-prod.cognite.ai"
      : ""

// Replace this with your app's ID on https://sentry.io/ -- if you do not have
// one (or do not have access to Sentry), stop by #frontend to ask for help. :)
static final String SENTRY_PROJECT_NAME =
    // This ternary is only in here to avoid accidentally publishing to the
    // wrong app once this template is used. You should remove this whole thing
    // and replace it with a static string.
    jenkinsHelpersUtil.determineRepoName() == 'react-demo-app'
      ? "react-demo-app"
      : ""

// The Sentry DSN is the URL used to report issues into Sentry. This can be
// found on your Sentry's project page, or by going here:
// https://docs.sentry.io/error-reporting/quickstart/?platform=browser
//
// If you omit this, then client errors WILL NOT BE REPORTED.
static final String SENTRY_DSN =
    // This ternary is only in here to avoid accidentally publishing to the
    // wrong app once this template is used. You should remove this whole thing
    // and replace it with a static string.
    jenkinsHelpersUtil.determineRepoName() == 'react-demo-app'
      ? "https://da67b4b23d3e4baea6c36de155a08491@sentry.io/3541732"
      : ""

// Specify your locize.io project ID. If you do not have one of these, please
// stop by #frontend to get a project created under the Cognite umbrella.
// See https://cog.link/i18n for more information.
//
// Note: You'll probably want to set this in scripts/start.sh too
static final String LOCIZE_PROJECT_ID =
    // This ternary is only in here to avoid accidentally publishing to the
    // wrong app once this template is used. You should remove this whole thing
    // and replace it with a static string.
    jenkinsHelpersUtil.determineRepoName() == 'react-demo-app'
      ? "1ee63b21-27c7-44ad-891f-4bd9af378b72"
      : ""

// Specify your Mixpanel project token. If you do not have one of these, please
// stop by #frontend to get a project created under the Cognite umbrella.
// Remember: if you can't measure it, you can't improve it!
static final String MIXPANEL_TOKEN =
    // This ternary is only in here to avoid accidentally publishing to the
    // wrong app once this template is used. You should remove this whole thing
    // and replace it with a static string.
    jenkinsHelpersUtil.determineRepoName() == 'react-demo-app'
      ? "1cc1cdc82fb93ec9a20a690216de41e4"
      : ""

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

static final String PR_COMMENT_MARKER = "[pr-server]\n"
static final String STORYBOOK_COMMENT_MARKER = "[storybook-server]\n"

static final String NODE_VERSION = 'node:12'

static final Map<String, String> CONTEXTS = [
  checkout: "continuous-integration/jenkins/checkout",
  setup: "continuous-integration/jenkins/setup",
  lint: "continuous-integration/jenkins/lint",
  unitTests: "continuous-integration/jenkins/unit-tests",
  preview: "continuous-integration/jenkins/preview",
  storybook: "continuous-integration/jenkins/storybook",
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
  'storybook',
  'preview',
  'staging',
  'production',
]

if (!
  (VERSIONING_STRATEGY == "single-branch"
  || VERSIONING_STRATEGY == "multi-branch")
) {
  throw new Error("Unknown value for VERSIONING_STRATEGY (${VERSIONING_STRATEGY})")
}

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
        properties([
          buildDiscarder(logRotator(daysToKeepStr: '30', numToKeepStr: '20'))
        ])
        node(POD_LABEL) {

          dir('main') {
            stageWithNotify('Checkout code', CONTEXTS.checkout) {
              checkout(scm)
            }
          }

          stage('Copy folders') {
            DIRS.each({
              sh("cp -r main ${it}")
            })
          }

          dir('main') {
            stageWithNotify('Install dependencies', CONTEXTS.setup) {
              yarn.setup()
            }

            stage('Symlink dependencies') {
              // Use symlinks to the dependency tree so that the entire
              // node_modules folder doesn't have to be copied.

              DIRS.each({
                sh("ln -s \$(pwd)/node_modules ../${it}/node_modules")
              })
            }
          }

          final boolean isStaging = env.BRANCH_NAME == "master"
          final boolean isProduction =
              VERSIONING_STRATEGY == 'single-branch'
                ? isStaging
                : env.BRANCH_NAME.startsWith("release-")

          body([
            isStaging: isStaging,
            isProduction: isProduction,
            isPullRequest: !!env.CHANGE_ID
          ])
        }
      }
    }
  }
}

pods { context ->
  final boolean isStaging = context.isStaging
  final boolean isProduction = context.isProduction
  final boolean isPullRequest = context.isPullRequest

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
            }
          }
        }
      },

      'Storybook': {
        dir('storybook') {
          if (!isPullRequest) {
            print "Preview storybooks only work for PRs"
            return
          }
          stageWithNotify('Storybook', CONTEXTS.storybook) {
            previewServer(
              buildCommand: 'yarn build-storybook',
              commentPrefix: STORYBOOK_COMMENT_MARKER,
              buildFolder: 'storybook-static',
              prefix: 'storybook',
            )
          }
        }
      },

      'Preview': {
        dir('preview') {
          if (!isPullRequest) {
            print "No PR previews for release builds"
            return
          }
          stageWithNotify('Preview', CONTEXTS.preview) {
            previewServer(
              buildCommand: 'yarn build preview',
              commentPrefix: PR_COMMENT_MARKER,
              buildFolder: 'build',
              prefix: 'pr',
            )
          }
        }
      },

      'Staging': {
        dir('staging') {
          if (!STAGING_DOMAIN_NAME) {
            print "No staging domain given; this app will not go to staging"
            return
          }
          if (!isStaging) {
            print "Staging builds only build on staging branches"
            return
          }
          stageWithNotify('Build for staging', CONTEXTS.buildStaging) {
            fas.build(
              useContainer: true,
              domainName: STAGING_DOMAIN_NAME,
              iap: isStaging,
              buildCommand: 'yarn build staging',
            )
          }
        }
      },

      'Production': {
        dir('production') {
          if (!PRODUCTION_DOMAIN_NAME) {
            print "No production domain given; this app will not go to production"
            return
          }
          if (!isProduction) {
            print "Production builds only build on production branches"
            return
          }
          stageWithNotify('Build for production', CONTEXTS.buildProduction) {
            fas.build(
              useContainer: true,
              domainName: PRODUCTION_DOMAIN_NAME,
              iap: false,
              buildCommand: 'yarn build production'
            )
          }
        }
      },
    ],
    workers: 3,
  )

  if (isStaging && STAGING_DOMAIN_NAME) {
    stageWithNotify('Publish staging build', CONTEXTS.publishStaging) {
      dir('staging') {
        fas.publish(
          useContainer: true,
        )
      }
    }
  }

  if (isProduction && PRODUCTION_DOMAIN_NAME) {
    stageWithNotify('Publish production build', CONTEXTS.publishProduction) {
      dir('production') {
        fas.publish(
          useContainer: true,
        )
      }
    }
  }
}
