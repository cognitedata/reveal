@Library('jenkins-helpers') _

// This is all the applications in the monorepo. Register your application name here
// in addition to updating the 'PROPECTION_APP_IDS' & 'PREVIEW_PACKAGE_NAMES'
static final String[] APPLICATIONS = [
  'platypus',
  'data-exploration',
  'coding-conventions',
  'copilot',
  'industry-canvas-ui',
  'iot-hub',
  'cdf-document-search',
  'extraction-pipelines',
]

/*
  This defines which NPM libraries will be deployed, to trigger a deployment increment
  the version in the package.json file of your package.
*/
static final Map<String, String> NPM_PACKAGES = [
  'shared-plotting-components': "dist/libs/shared/plotting-components"
]

// This is the Firebase site mapping.
// See https://github.com/cognitedata/terraform/blob/master/cognitedata-production/gcp_firebase_hosting/sites.tf
static final Map<String, String> FIREBASE_APP_SITES = [
  'platypus': 'platypus',
  'data-exploration': 'data-exploration',
  'coding-conventions': 'coding-conventions',
  'copilot': 'copilot',
  'industry-canvas-ui': 'industry-canvas-ui',
  'iot-hub': 'iot-hub',
  'cdf-document-search': 'document-search',
  'extraction-pipelines': 'extraction-pipelines',
]

static final Map<String, String> PREVIEW_PACKAGE_NAMES = [
  'platypus': "@cognite/cdf-solutions-ui",
  'data-exploration': "@cognite/cdf-data-exploration",
  'coding-conventions': "@cognite/cdf-coding-conventions",
  'copilot': "@cognite/cdf-copilot",
  'industry-canvas-ui': "@cognite/cdf-industry-canvas-ui",
  'iot-hub': "@cognite/cdf-iot-hub",
  'cdf-document-search': '@cognite/cdf-document-search-ui',
  'extraction-pipelines': '@cognite/cdf-integrations-ui',
]

// Replace this with your app's ID on https://sentry.io/ -- if you do not have
// one (or do not have access to Sentry), stop by #frontend to ask for help. :)
static final Map<String, String> SENTRY_PROJECT_NAMES = [
  'platypus': "platypus",
  'data-exploration': "data-explorer",
  'coding-conventions': "coding-conventions"
]

// Add apps/libs name to the list where you want the storybook preview to build.
static final String[] PREVIEW_STORYBOOK = [
  'platypus',
  'data-exploration-components-old',
  'shared-plotting-components'
]

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
  'data-exploration': 'multi-branch',
  'copilot': 'single-branch',
  'iot-hub': 'single-branch',
  'cdf-document-search': 'single-branch',
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

  return affected.split(",");
}


def shouldDeployPackage(String packageName, Map<String, String> NPM_PACKAGES, boolean isMaster) {
  if(NPM_PACKAGES[packageName] == null || !isMaster){
    return false;
  }

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


      parallel(
        'Storybook': {
          container('apphosting') {
            if (!isPullRequest) {
              print 'No storybook reviews for release builds'
              return;
            }

            for (int i = 0; i < projects.size(); i++) {
              def project = projects[i];
              if (!PREVIEW_STORYBOOK.contains(project)) {
                continue;
              }

              stageWithNotify("Build and deploy Storybook for: ${project}") {
                previewServer(
                  prefix: "storybook-${project}",
                  commentPrefix: "[storybook-server:${project}]\n",
                  buildCommand: "yarn build-storybook ${project}",
                  buildFolder: "storybook-static",
                )
              }
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

            for (int i = 0; i < projects.size(); i++) {
              def project = projects[i];
              def packageName = PREVIEW_PACKAGE_NAMES[project]

              if (packageName == null) {
                print "No preview available for: ${project}"
                continue
              }

              dir("apps/${project}") {
                // Run the yarn install in the app in cases of local packages.json file
                if (fileExists("yarn.lock")) {
                  yarn.setup()
                }
              }

              stageWithNotify("Build and deploy PR for: ${project}") {
                def prefix = "${jenkinsHelpersUtil.determineRepoName()}-${project}"
                def domain = 'fusion-preview'
                previewServer(
                  repo: domain,
                  prefix: prefix,
                  buildCommand: "yarn build preview ${project}",
                  buildFolder: "dist/apps/${project}",
                )
                deleteComments(PR_COMMENT_MARKER)
                def url = "https://fusion-pr-preview.cogniteapp.com/?externalOverride=${packageName}&overrideUrl=https://${prefix}-${env.CHANGE_ID}.${domain}.preview.cogniteapp.com/index.js"
                pullRequest.comment("[FUSION_PREVIEW_URL] Use cog-appdev as domain. Click here to preview: [$url]($url) for application ${project}<br><br>![AppBadge](https://img.shields.io/static/v1?label=Application&message=${project}&color=orange)")
              }
            }
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
                  buildCommand: "yarn build production ${project}",
                  buildFolder: "dist/apps/${project}",
                  isFusionSubapp: true,
                )

                slack.send(
                  channel: SLACK_CHANNEL,
                  message: "Deployment of ${env.BRANCH_NAME} complete for: ${project}!"
                )
              }

              if(project == "platypus"){
                stageWithNotify('Save missing keys to locize') {
                  sh("yarn i18n-push")
                }
                stageWithNotify('Remove deleted keys from locize') {
                  sh("yarn i18n-remove-deleted")
                }
              }
            }
          }
        }
      )
    }
  }
}
