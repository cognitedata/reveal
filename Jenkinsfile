@Library('jenkins-helpers') _

static final String PR_COMMENT_MARKER = "🚀[pr-server]\n"
static final String SLACK_ALERTS_CHANNEL = "#cdf-ui-devs-alerts"
static final String APP_ID = 'cdf-data-sets'
static final String APPLICATION_REPO_ID = 'cdf-ui-data-sets'
static final String FUSION_SUBAPP_NAME = '@cognite/cdf-data-sets'
static final String NODE_VERSION = 'node:18'
//static final String NODE_VERSION = 'node:14'
static final String VERSIONING_STRATEGY = "single-branch"
static final String STORYBOOK_COMMENT_MARKER = '[storybook-server]\n'

final boolean isMaster = env.BRANCH_NAME == 'master'
final boolean isRelease = env.BRANCH_NAME.startsWith('release-')
final boolean isPullRequest = !!env.CHANGE_ID

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
        locizeProjectId: LOCIZE_PROJECT_ID,
        mixpanelToken: MIXPANEL_TOKEN,
        envVars: [
          locizeApiKey,
          envVar(
            key: 'REACT_APP_LOCIZE_PROJECT_ID',
            value: LOCIZE_PROJECT_ID
          ),
          envVar(
            key: 'REACT_APP_MIXPANEL_TOKEN',
            value: MIXPANEL_TOKEN
          )
        ]
      ) {
        codecov.pod {
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
                def prefix = "${jenkinsHelpersUtil.determineRepoName()}-${project}"
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
        }
       )

    }
  }
}