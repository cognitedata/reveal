@Library('jenkins-helpers') _

static final String PR_COMMENT_MARKER = "🚀[pr-server]\n"
static final String APP_ID = 'cdf-data-sets'
static final String FIREBASE_APP_SITE = 'data-catalog'
static final String FUSION_SUBAPP_NAME = '@cognite/cdf-data-sets'
static final String NODE_VERSION = 'node:14'

final boolean isMaster = env.BRANCH_NAME == 'master'
final boolean isRelease = env.BRANCH_NAME == 'release-data-catalog'
final boolean isPullRequest = !!env.CHANGE_ID


// Specify your projects alerting slack channel here. If you do not have one of these, please
// consider creating one for your projects alerts
static final String SLACK_CHANNEL = 'alerts-platypus'

def pods = { body ->
  yarn.pod(nodeVersion: NODE_VERSION) {
    previewServer.pod(nodeVersion: NODE_VERSION) {
      locizeApiKey = secretEnvVar(
        key: 'LOCIZE_API_KEY',
        secretName: 'fusion-locize-api-key',
        secretKey: 'FUSION_LOCIZE_API_KEY'
      )
      appHosting.pod(
        nodeVersion: NODE_VERSION,
        envVars: [
          locizeApiKey
        ]
      ) {
          testcafe.pod() {
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
  app.safeRun(
    slackChannel: SLACK_CHANNEL,
    logErrors: isMaster || isRelease
  ) {
    dir('main') {
      stage('Checkout code') {
        echo sh(script: 'env|sort', returnStdout: true)
        checkout(scm)
      }

      stage('Delete comments') {
        deleteComments(PR_COMMENT_MARKER)
      }

      stage('Install dependencies') {
        yarn.setup()
      }

      stage('Git setup') {
          // the apphosting container interacts with git when running npx commands.
          // since the git checkout is done in a different container,
          // the user permissions seem altered when git is executed from the node container,
          // therefore we need to mark the folder as safe
          container('apphosting') {
            sh("git config --global --add safe.directory ${env.WORKSPACE}/main")
          }
      }

       parallel(
        'Lint': {
          container('apphosting') {
            stageWithNotify('Lint') {
              sh("yarn lint")
            }
          }
        },
        'Preview': {
          container('apphosting') {
            if (!isPullRequest) {
              print 'No PR previews for release builds'
              return
            }

            deleteComments('[FUSION_PREVIEW_URL]')

              // Run the yarn install in the app in cases of local packages.json file
              if (fileExists("yarn.lock")) {
                yarn.setup()
              }

              stageWithNotify("Build and deploy PR for: ${APP_ID}") {
                def prefix = jenkinsHelpersUtil.determineRepoName();
                def domain = "fusion-preview";
                previewServer(
                  buildCommand: 'yarn build',
                  buildFolder: 'build',
                  prefix: prefix,
                  repo: domain
                )
                deleteComments("[FUSION_PREVIEW_URL]")
                def url = "https://fusion-pr-preview.cogniteapp.com/?externalOverride=${FUSION_SUBAPP_NAME}&overrideUrl=https://${prefix}-${env.CHANGE_ID}.${domain}.preview.cogniteapp.com/index.js";
                pullRequest.comment("[FUSION_PREVIEW_URL] [$url]($url)");
              }
            
          }
        },

        'Release': {
          container('apphosting') {
            if (isPullRequest) {
              print 'No deployment on PR branch'
              return;
            }

            // Run the yarn install in the app in cases of local packages.json file
            if (fileExists("yarn.lock")) {
              yarn.setup()
            }

            stageWithNotify("Publish production build: ${APP_ID}") {
              appHosting(
                appName: FIREBASE_APP_SITE,
                environment: isRelease ? 'production' : 'staging',
                firebaseJson: 'build/firebase.json',
                buildCommand: "yarn build",
                buildFolder: 'build',
              )

              slack.send(
                channel: SLACK_CHANNEL,
                message: "Production deployment of ${env.BRANCH_NAME} complete for: ${APP_ID}!"
              )
            }

            stageWithNotify('Save missing keys to locize') {
              sh("yarn save-missing")
            }
            stageWithNotify('Remove deleted keys from locize') {
              sh("yarn remove-deleted")
            }

          }
        }
       )

    }
  }
}