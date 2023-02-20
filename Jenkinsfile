@Library('jenkins-helpers') _

static final String PR_COMMENT_MARKER = "🚀[pr-server]\n"
static final String APP_ID = 'cdf-data-sets'
static final String FIREBASE_APP_SITE = 'data-catalog'
static final String FUSION_SUBAPP_NAME = '@cognite/cdf-data-sets'
static final String NODE_VERSION = 'node:14'

static final String VERSIONING_STRATEGY = "single-branch"

final boolean isMaster = env.BRANCH_NAME == 'master'
final boolean isRelease = env.BRANCH_NAME.startsWith('release-')
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
          withCredentials([usernamePassword(credentialsId: 'githubapp', passwordVariable: 'GITHUB_TOKEN', usernameVariable: 'GH_USER')]) {
            sh("git config --global credential.helper '!f() { sleep 1; echo \"username=${GH_USER}\"; echo \"password=${GITHUB_TOKEN}\"; }; f'")
            if (isPullRequest) {
              sh("git fetch origin ${env.CHANGE_TARGET}:refs/remotes/origin/${env.CHANGE_TARGET}")
            } else {
              // NOTE: I am suspecting that 'master' has to be changed with ${env.BRANCH_NAME} to work for release- branches
              sh("git fetch origin master:refs/remotes/origin/master")
            }
          }
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
        'Test': {
          container('apphosting') {
            stageWithNotify('Unit tests') {
              sh("yarn test")
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

              def project = APP_ID;
              def packageName = FUSION_SUBAPP_NAME;

              if (packageName == null) {
                print "No preview available for: ${project}"
                return
              }

              // Run the yarn install in the app in cases of local packages.json file
              if (fileExists("yarn.lock")) {
                yarn.setup()
              }

              stageWithNotify("Build and deploy PR for: ${project}") {
                def prefix = jenkinsHelpersUtil.determineRepoName();
                def domain = 'fusion-preview'
                previewServer(
                  repo: domain,
                  prefix: prefix,
                  buildCommand: "yarn build",
                  buildFolder: "build",
                )
                deleteComments(PR_COMMENT_MARKER)
                def url = "https://fusion-pr-preview.cogniteapp.com/?externalOverride=${packageName}&overrideUrl=https://${prefix}-${env.CHANGE_ID}.${domain}.preview.cogniteapp.com/index.js"
                pullRequest.comment("[FUSION_PREVIEW_URL] Use cog-appdev as domain. Click here to preview: [$url]($url) for application ${project}")
              }
            
          }
        },

        'Release': {
          container('apphosting') {

            if (isPullRequest) {
              print 'No deployment on PR branch'
              return;
            }

            def project = APP_ID;
            def firebaseSiteName = FIREBASE_APP_SITE;

            // keeping for now, this is very common config that can be reused everywhere
            final boolean isReleaseBranch = env.BRANCH_NAME.startsWith("release-${project}")
            final boolean isUsingSingleBranchStrategy = VERSIONING_STRATEGY == 'single-branch';
            final boolean releaseToProd = isUsingSingleBranchStrategy || isReleaseBranch;

            // Run the yarn install in the app in cases of local packages.json file
            if (fileExists("yarn.lock")) {
              yarn.setup()
            }

            // when using single branch strategy, we wil have to deploy the build on prod and staging
            if(isUsingSingleBranchStrategy) {
               stageWithNotify("Publish staging build: ${project}") {
                appHosting(
                  appName: firebaseSiteName,
                  environment: 'staging',
                  firebaseJson: 'build/firebase.json',
                  buildCommand: "yarn build",
                  buildFolder: 'build',
                )

                slack.send(
                  channel: SLACK_CHANNEL,
                  message: "Staging deployment of ${env.BRANCH_NAME} complete for: ${project}!"
                )
              }
            }

            stageWithNotify("Publish production build: ${project}") {
              appHosting(
                appName: firebaseSiteName,
                environment: releaseToProd ? 'production' : 'staging',
                firebaseJson: 'build/firebase.json',
                buildCommand: "yarn build",
                buildFolder: 'build',
              )

              slack.send(
                channel: SLACK_CHANNEL,
                message: "Production deployment of ${env.BRANCH_NAME} complete for: ${project}!"
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