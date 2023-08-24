@Library('jenkins-helpers') _

// This is all the applications in the monorepo. Register your application name here
// in addition to updating the 'PROPECTION_APP_IDS' & 'PREVIEW_PACKAGE_NAMES'
static final String[] APPLICATIONS = [
  'platypus',
  'vision',
  'data-catalog',
  'raw-explorer',
  'coding-conventions',
  'contextualization-ui',
  'copilot',
  'industry-canvas-ui',
  'interactive-diagrams',
  'iot-hub',
  'functions-ui',
  '3d-management',
  'transformations',
  'cdf-document-search',
  'extraction-pipelines',
  'extractor-downloads',
  'charts',
  'entity-matching',
  'access-management',
  'notebook',
  'fusion-shell',
  'simint'
]

/*
  This defines which NPM libraries will be deployed, to trigger a deployment increment
  the version in the package.json file of your package.
*/
static final Map<String, String> NPM_PACKAGES = [
  'shared-plotting-components': "dist/libs/shared/plotting-components",
  'user-profile-components': "dist/libs/shared/user-profile-components",
  'user-onboarding-components': "dist/libs/shared/user-onboarding-components",
  'cdf-ui-i18n-utils': "dist/libs/shared/cdf-ui-i18n-utils",
  'cdf-utilities': 'dist/libs/shared/cdf-utilities',
  'cdf-login-utils': 'dist/libs/shared/cdf-login-utils',
]

// This is the Firebase site mapping.
// See https://github.com/cognitedata/terraform/blob/master/cognitedata-production/gcp_fusion_firebase_hosting/sites.tf
static final Map<String, String> FIREBASE_APP_SITES = [
  'platypus': 'platypus',
  'vision': 'vision',
  'data-catalog': 'data-catalog',
  'raw-explorer': 'raw-explorer',
  'coding-conventions': 'coding-conventions',
  'contextualization-ui': 'contextualization-ui',
  'copilot': 'copilot',
  'industry-canvas-ui': 'industry-canvas-ui',
  'interactive-diagrams': 'pnid-contextualization',
  'iot-hub': 'iot-hub',
  '3d-management': '3d-management',
  'transformations': 'transformations',
  'cdf-document-search': 'document-search',
  'functions-ui': 'functions',
  'extraction-pipelines': 'extraction-pipelines',
  'extractor-downloads': 'extractor-downloads',
  'charts': 'charts',
  'entity-matching': 'entity-matching',
  'access-management': 'access-management',
  'notebook': 'notebook',
  'fusion-shell': 'ui-host',
  'simint': 'simint'
]


// Replace this with your app's ID on https://sentry.io/ -- if you do not have
// one (or do not have access to Sentry), stop by #frontend to ask for help.
static final Map<String, String> SENTRY_PROJECT_NAMES = [
  'platypus': "platypus",
  'coding-conventions': "coding-conventions",
  'charts': 'cognite-charts'
]

  // '3d-management',
  // Should be added after monorepo storybook version is upgraded to v7.

// The Sentry DSN is the URL used to report issues into Sentry. This can be
// found on your Sentry's project page, or by going here:
// https://docs.sentry.io/error-reporting/quickstart/?platform=browser


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
static final Map<String, String> VERSIONING_STRATEGY = [
  'platypus': 'multi-branch',
  'coding-conventions': 'multi-branch',
  'contextualization-ui': 'single-branch',
  'data-exploration': 'multi-branch',
  'vision': 'single-branch',
  'data-catalog': 'multi-branch',
  'raw-explorer': 'multi-branch',
  '3d-management': 'single-branch',
  'transformations': 'multi-branch',
  'copilot': 'single-branch',
  'iot-hub': 'single-branch',
  'interactive-diagrams': 'multi-branch',
  'cdf-document-search': 'single-branch',
  'extraction-pipelines': 'single-branch',
  'extractor-downloads': 'single-branch',
  'charts': 'multi-branch',
  'entity-matching': 'single-branch',
  'functions-ui' : 'single-branch',
  'access-management': 'multi-branch',
  'notebook': 'single-branch',
  'fusion-shell': 'multi-branch',
  'simint': 'multi-branch',
]

// The config of which apps have i18n strings that need to be synced to and pulled from locize.io
static final String[] I18N_APPLICATIONS = [
  'platypus',
  'data-exploration',
  'flexible-data-explorer'
]

// == End of customization. Everything below here is common. == \\

static final String NODE_VERSION = 'node:18'

static final String PR_COMMENT_MARKER = '[pr-server]\n'
static final String STORYBOOK_COMMENT_MARKER = '[storybook-server]\n'

final boolean isMaster = env.BRANCH_NAME == 'master'
final boolean isRelease = env.BRANCH_NAME.startsWith('release-')
final boolean isPullRequest = !!env.CHANGE_ID

/**
 * Get list of affected projects.
 *
 * @return Array List of affected items
 */
def getAffectedProjects(boolean isPullRequest = true, boolean isMaster = false, boolean isRelease = false, String[] applications) {
  if (isRelease) {
    for (int i = 0; i < applications.size(); i++) {
      if (env.BRANCH_NAME.contains(applications[i])) {
        print "[AFFECTED]: Found release application: ${applications[i]}"
        return applications[i].split() // splitting to turn a string into an array (e.g., 'platypus' -> [platypus])
      }
    }

    print "[AFFECTED]: No matching applications found in release branch name, try either of: ${applications.join(', ')}"
    return []
  }

  if (isPullRequest || isMaster) {
    def target = 'build'
    def select = 'tasks.target.project'

    def affected

    // Using the NX's affected tree to determine which applications were changed in the branch.
    // The 'base' value is derived from the NX documentation, see: https://nx.dev/recipes/ci/monorepo-ci-jenkins
    if (isPullRequest) {
      affected = sh(script: "./node_modules/.bin/nx print-affected --base=origin/${env.CHANGE_TARGET} --plain --target=${target} --select=${select}", returnStdout: true)
    }
    if (isMaster) {
      affected = sh(script: "./node_modules/.bin/nx print-affected --base=HEAD~1 --plain --target=${target} --select=${select}", returnStdout: true)
    }

    if (!affected) {
      print "[AFFECTED:NX] No affected applications were found!"
      return []
    }

    print "[AFFECTED:NX] Affected projects: ${affected}"

    return affected.replaceAll('[\r\n]+', '').split(', ')
  }

  print "[AFFECTED]: Oh no! You reached an edge-case that should not have been met. Contact your friends in #frontend for help (branch name: ${env.BRANCH_NAME})"
  return []
}

def getAffectedLibs(boolean isMaster = false){
  if(!isMaster){
    return [];
  }

  affected = sh(
    script: "./node_modules/.bin/nx print-affected --type=lib --base=HEAD~1 --select=projects",
    returnStdout: true
  );

  print "[AFFECTED:NX] Affected libraries: ${affected}";

  return affected.replaceAll('[\r\n]+', '').split(', ');
}


def shouldDeployPackage(String packageName, Map<String, String> NPM_PACKAGES, boolean isMaster) {
  if(NPM_PACKAGES[packageName] == null || !isMaster){
    return false;
  }

  sh(script: "./node_modules/.bin/nx build ${packageName}", returnStdout: true);

  def packageJson = "${NPM_PACKAGES[packageName]}/package.json";

  def packageJsonString = sh(
    script: "cat ${packageJson}",
    returnStdout: true
  );

  def packageDetails = readJSON text: packageJsonString;
  print(packageDetails);

  def npmPackageInfo = "npm view ${packageDetails.name} version";

  def packageExistsStatus = sh(
    script: npmPackageInfo,
    returnStatus: true
  );

  if(packageExistsStatus != 0){
    // Package does not exist in our NPM org, assuming first time deployment
    return true;
  }

  def npmVersion = sh(
    script: npmPackageInfo,
    returnStdout: true
  ).replaceAll("\\.","") as int;

  def packageVersion = packageDetails.version.replaceAll("\\.","") as int;

  return packageVersion > npmVersion;
}


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
    logErrors: isMaster || isRelease,
    timeout: 150
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
          // NX needs the references to the master in order to check affected projects.
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

      def projects;
      stage('Get affected projects') {
        container('apphosting') {
          projects = getAffectedProjects(isPullRequest, isMaster, isRelease, APPLICATIONS)
        }
      }

      stage('Publish NPM') {
        container('apphosting') {
          if (!isMaster) {
            print 'NPM package publish only runs in master branch'
            return
          }
          def runAffectedTarget = sh(script: "./node_modules/.bin/nx affected --target=npm --base=HEAD~1", returnStdout: true);
          print(runAffectedTarget)
          def affectedLibraries = getAffectedLibs(isMaster);
          print(affectedLibraries);
          sh(script: "cp /npm-credentials/npm-public-credentials.txt ~/.npmrc");
          sh(script: "npm whoami");
          for (lib in affectedLibraries) {
            if(shouldDeployPackage(lib, NPM_PACKAGES, isMaster)){
              def libBuildPath = NPM_PACKAGES[lib];
              sh(script: "npm publish ${libBuildPath}");
            }

          }
        }
      }

     /**
      ---------------------------------------------------
      UNCOMMENT THIS IF SOMETHING IS WRONG WITH GITHUB CD
      ---------------------------------------------------
      */

      parallel(
        'Preview': {
          container('apphosting') {
            if (!isPullRequest) {
              print 'No PR previews for release builds'
              return
            }

            //this can be deleted at the end, left it to delete comments in older PRs
            deleteComments('[FUSION_PREVIEW_URL]')
          }
        },

        'Release': {
          container('apphosting') {
            print "branch name: ${env.BRANCH_NAME}";
            print "change id: ${env.CHANGE_ID}";
            print "isMaster: ${isMaster}";
            print "isRelease: ${isRelease}";

            if (isPullRequest) {
              print 'No deployment on PR branch'
              return;
            }

            for (int i = 0; i < projects.size(); i++) {
              def project = projects[i];
              def firebaseSiteName = FIREBASE_APP_SITES[project];

              if (firebaseSiteName == null) {
                print "No release available for: ${project}"
                continue;
              }

              final boolean isPreviewBranch = env.BRANCH_NAME.startsWith("release-preview-${project}")
              final boolean isReleaseBranch = !isPreviewBranch && env.BRANCH_NAME.startsWith("release-${project}")
              final boolean isUsingSingleBranchStrategy = VERSIONING_STRATEGY[project] == 'single-branch';
              final boolean releaseToProd = isUsingSingleBranchStrategy || isReleaseBranch;

               if (releaseToProd) {
                   releaseEnvironment = 'production'
               } else if (isPreviewBranch) {
                   releaseEnvironment = 'preview'
               } else {
                   releaseEnvironment = 'staging'
               }

              // Run the yarn install in the app in cases of local packages.json
              dir("apps/${project}") {
                if (fileExists("yarn.lock")) {
                  yarn.setup()
                }
              }

              stageWithNotify("Publish production build: ${project}") {
                appHosting(
                  appName: firebaseSiteName,
                  environment: releaseEnvironment,
                  firebaseJson: "dist/apps/${project}/firebase.json",
                  buildCommand: "NODE_OPTIONS=--max-old-space-size=8192 yarn build ${releaseEnvironment} ${project}",
                  buildFolder: "dist/apps/${project}",
                  isFusionSubapp: true,
                )

                slack.send(
                  channel: SLACK_CHANNEL,
                  message: "Deployment of ${env.BRANCH_NAME} complete for: ${project}!"
                )
              }

              if(I18N_APPLICATIONS.contains(project)){
                stageWithNotify('Save missing keys to locize') {
                  sh("yarn i18n-push ${project}")
                }
                stageWithNotify('Remove deleted keys from locize') {
                  sh("yarn i18n-remove-deleted ${project}")
                }
              }
            }
          }
        }
      )
    }
  }
}
