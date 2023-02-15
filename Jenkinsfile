@Library('jenkins-helpers') _

// This is your FAS app id to be used in Fusion.
// At this point, Fusion enforces all sub-app packages to be prefixed with cdf-.
static final String FUSION_APP_ID = 'cdf-charts-ui'

// This is your FAS app identifier (repo) shared across both production and staging apps
// in order to do a commit lookup (commits are shared between apps).
static final String APPLICATION_REPO_ID = 'cognite-charts'

// Replace this with your app's ID on https://sentry.io/ -- if you do not have
// one (or do not have access to Sentry), stop by #frontend to ask for help. :)
static final String SENTRY_PROJECT_NAME = 'cognite-charts'

// Specify your Mixpanel project token. If you do not have one of these, please
// stop by #frontend to get a project created under the Cognite umbrella.
// Remember: if you can't measure it, you can't improve it!
static final String MIXPANEL_TOKEN = '0837d632cca24291a0a1025d488d1a9a' // pragma: allowlist secret

// Specify your projects alerting slack channel here. If you do not have one of these, please
// consider creating one for your projects alerts
static final String SLACK_CHANNEL = 'alerts-charts-dev'

static final String PR_COMMENT_MARKER = '[pr-server]\n'

static final String VERSIONING_STRATEGY = 'multi-branch'
environment = versioning.getEnv(versioningStrategy: VERSIONING_STRATEGY)

static final String NODE_VERSION = 'node:14'

static final Map<String, String> CONTEXTS = [
  checkout: 'continuous-integration/jenkins/checkout',
  setup: 'continuous-integration/jenkins/setup',
  buildFusion: 'continuous-integration/jenkins/build-fusion',
  buildFusionPreview: 'continuous-integration/jenkins/build-fusion-preview',
  publishFusion: 'continuous-integration/jenkins/publish-fusion'
]

// Copy these before installing dependencies so that we don't have to
// copy the entire node_modules directory tree as well.
static final String[] DIRS = [
  'fusion',
  'fusion-preview'
]

String appEnv() {
  String appEnv = 'development'
  if (environment.isProduction) { appEnv = 'production' }
  if (environment.isStaging) { appEnv = 'staging' }
  if (environment.isPullRequest) { appEnv = 'preview' }
  return appEnv
}

def scmVars = { };
// Usually the condition is branch name containing "release-",
// but because the Fusion branch is called release/fusion we changed it.
// Ideally should be changed back to "release-" after Fusion branch gets merged to master
def isRelease = env.BRANCH_NAME == 'main' || env.BRANCH_NAME.contains("release/fusion");

def pods = { body ->
  yarn.pod(nodeVersion: NODE_VERSION) {
    previewServer.pod(nodeVersion: NODE_VERSION) {
      locizeApiKey = secretEnvVar(
        key: 'REACT_APP_LOCIZE_API_KEY',
        secretName: 'charts-frontend',
        secretKey: 'CHARTS_LOCIZE_API_KEY',
        optional: environment.isProduction
      )
      fas.pod(
        nodeVersion: NODE_VERSION,
        sentryProjectName: SENTRY_PROJECT_NAME,
        mixpanelToken: MIXPANEL_TOKEN,
        envVars: [
          locizeApiKey,
          envVar(key: 'REACT_APP_ENV', value: appEnv())
        ]
      ) {
        node(POD_LABEL) {
          dir('main') {
            stageWithNotify('Checkout code', CONTEXTS.checkout) {
              scmVars = checkout(scm)
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
  app.safeRun(
    slackChannel: SLACK_CHANNEL,
    logErrors: true
  ) {
      withEnv(["REACT_APP_COMMIT_REF=${scmVars.GIT_COMMIT}"]) {
        threadPool(
          tasks: [
            'Preview Fusion': {
              dir('fusion-preview') {
                stageWithNotify('Build for preview - Fusion', CONTEXTS.buildFusionPreview) {
                  if (!environment.isPullRequest) {
                    print "No PR previews for release builds"
                    return;
                  }
                  def package_name = "@cognite/${FUSION_APP_ID}";
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

            'Fusion': {
              dir('fusion') {
                stageWithNotify('Build for Fusion', CONTEXTS.buildFusion) {
                  if (environment.isPullRequest) {
                    println "Skipping Fusion Charts build for pull requests"
                    return
                  }
                  fas.build(
                    appId: FUSION_APP_ID,
                    repo: APPLICATION_REPO_ID,
                    buildCommand: 'yarn build',
                    shouldPublishSourceMap: false,
                  )
                }
              }
            },
          ],
          workers: 2,
        )
      }
      if (isRelease) {
      stageWithNotify('Publish Fusion build', CONTEXTS.publishFusion) {
        dir('fusion') {
          fas.publish(
            shouldPublishSourceMap: false
          )
        }
      }
    }
  }
}
