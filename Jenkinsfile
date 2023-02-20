@Library('jenkins-helpers') _

static final String PR_COMMENT_MARKER = "🚀[pr-server]\n"
static final String SLACK_ALERTS_CHANNEL = "#cdf-ui-devs-alerts" //fusion sub-apps/projects alerting slack channel
static final String APP_ID = 'cdf-access-management' 
static final String FIREBASE_APP_SITE = 'access-management'
static final String FUSION_SUBAPP_NAME = '@cognite/cdf-access-management'
static final String NODE_VERSION = 'node:14'
static final String VERSIONING_STRATEGY = "single-branch"

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
        envVars: [
          locizeApiKey,
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
  def gitCommit
  def getTitle
  def gitAuthor
  def context_install = "continuous-integration/jenkins/install"

  def project = APP_ID;
  def packageName = FUSION_SUBAPP_NAME;
  def firebaseSiteName = FIREBASE_APP_SITE;

  app.safeRun(
    slackChannel: SLACK_ALERTS_CHANNEL,
    logErrors: isMaster || isRelease
  ) {
    dir('main') {
      stage("Checkout code") {
        checkout(scm)
        gitCommit = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
        gitTitle = sh(returnStdout: true, script: "git show -s --format='%s' HEAD").trim()
        gitAuthor = sh(returnStdout: true, script: "git show -s --format='%ae' HEAD").trim()
      }

      stage('Delete comments') {
        deleteComments(PR_COMMENT_MARKER)
      }

      githubNotifyWrapper(context_install) {
        stage('Install dependencies') {
          yarn.setup()
        }
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
        'Preview': {
          container('apphosting') {
            if (!isPullRequest) {
              print 'No PR previews for release builds'
              return
            }

            deleteComments('[FUSION_PREVIEW_URL]')

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
              def domain = "fusion-preview";
              previewServer(
                buildCommand: 'yarn build',
                buildFolder: 'build',
                prefix: prefix,
                repo: domain
              )
              deleteComments("[FUSION_PREVIEW_URL]")
              def url = "https://fusion-pr-preview.cogniteapp.com/?externalOverride=${packageName}&overrideUrl=https://${prefix}-${env.CHANGE_ID}.${domain}.preview.cogniteapp.com/index.js";
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

            // keeping for now, this is very common config that can be reused everywhere
            final boolean isReleaseBranch = env.BRANCH_NAME.startsWith("release-${project}")
            final boolean isUsingSingleBranchStrategy = VERSIONING_STRATEGY == 'single-branch';
            final boolean releaseToProd = isUsingSingleBranchStrategy || isReleaseBranch;

            print "isReleaseBranch: ${isReleaseBranch}";
            print "isUsingSingleBranchStrategy: ${isUsingSingleBranchStrategy}";
            print "releaseToProd: ${releaseToProd}";

            // Run the yarn install in the app in cases of local packages.json file
            if (fileExists("yarn.lock")) {
              yarn.setup()
            }

            stageWithNotify('Save missing keys to locize') {
              sh("yarn save-missing")
            }

            stageWithNotify('Remove deleted keys from locize') {
              sh("yarn remove-deleted")
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
                channel: SLACK_ALERTS_CHANNEL,
                message: "Deployment of ${env.BRANCH_NAME} complete for: ${project}!"
              )
            }
          }
        }
       )
    }
  }
}
