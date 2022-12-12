@Library('jenkins-helpers') _

// This is all the applications in the monorepo. Register your application name here
// in addition to updating the 'PROPECTION_APP_IDS' & 'PREVIEW_PACKAGE_NAMES'
def APPLICATIONS = ['platypus', 'data-exploration']

// This is your FAS production app id.
// At this time, there is no production build for the demo app.
// static final String PRODUCTION_APP_ID = 'cdf-solutions-ui'
static final Map<String, String> PRODUCTION_APP_IDS = [
  'platypus': "cdf-solutions-ui",
  'data-exploration': "cdf-data-exploration",
]

static final Map<String, String> PREVIEW_PACKAGE_NAMES = [
  'platypus': "@cognite/cdf-solutions-ui",
  'data-exploration': "@cognite/cdf-data-exploration",
]

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
// static final String VERSIONING_STRATEGY = 'single-branch'

// == End of customization. Everything below here is common. == \\

static final String NODE_VERSION = 'node:14'

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
def getAffectedProjects(boolean isPullRequest = true, boolean isMaster = false, boolean isRelease = false) {
  if (isRelease) {
    for (int i = 0; i < APPLICATIONS.size(); i++) {
      if (env.BRANCH_NAME.contains(APPLICATIONS[i])) {
        print "[AFFECTED]: Found release application: ${APPLICATIONS[i]}"
        return APPLICATIONS[i].split() // splitting to turn a string into an array (e.g., 'platypus' -> [platypus])
      }
    }

    print "[AFFECTED]: No matching applications found in release branch name, try either of: ${APPLICATIONS.join(', ')}"
    return []
  }

  if (isPullRequest || isMaster) {
    def target = 'build'
    def select = 'tasks.target.project'

    def affected

    // Using the NX's affected tree to determine which applications were changed in the branch.
    // The 'base' value is derived from the NX documentation, see: https://nx.dev/recipes/ci/monorepo-ci-jenkins
    if (isPullRequest) {
      affected = sh(script: "npx nx print-affected --base=origin/${env.CHANGE_TARGET} --plain --target=${target} --select=${select}", returnStdout: true)
    }
    if (isMaster) {
      affected = sh(script: "npx nx print-affected --base=HEAD~1 --plain --target=${target} --select=${select}", returnStdout: true)
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

            ])

            node(POD_LABEL) {
              dir('main') {
                stage('Checkout code') {
                  checkout(scm)
                }

                stage('Delete comments') {
                  deleteComments(PR_COMMENT_MARKER)
                }

                stage('Install dependencies') {
                  yarn.setup()
                }
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
  app.safeRun(
    slackChannel: SLACK_CHANNEL,
    logErrors: isMaster || isRelease
  ) {
    dir('main') {
      stage('git setup') {
        // NX needs the references to the master in order to check affected projects.
        withCredentials([usernamePassword(credentialsId: 'githubapp', passwordVariable: 'GITHUB_TOKEN', usernameVariable: 'GH_USER')]) {
          sh("git config --global credential.helper '!f() { sleep 1; echo \"username=${GH_USER}\"; echo \"password=${GITHUB_TOKEN}\"; }; f'")
          sh("git fetch origin master:refs/remotes/origin/master")
        }
      }

      parallel(
        'Storybook': {
          container('fas') {
            if (!isPullRequest) {
              print 'No storybook reviews for release builds'
              return;
            }

            def projects = getAffectedProjects(isPullRequest, isMaster, isRelease)

            if (projects.contains('platypus')) {
              stageWithNotify("Build and deploy Storyboor for: 'platypus'") {
                previewServer(
                  prefix: 'storybook',
                  commentPrefix: STORYBOOK_COMMENT_MARKER,
                  buildCommand: "yarn build-storybook",
                  buildFolder: 'storybook-static',
                )
              }
            }
          }
        },

        'Preview': {
          container('fas') {
            if (!isPullRequest) {
              print 'No PR previews for release builds'
              return
            }

            def projects = getAffectedProjects(isPullRequest, isMaster, isRelease)

            for (int i = 0; i < projects.size(); i++) {
              def packageName = PREVIEW_PACKAGE_NAMES[projects[i]]

              if (packageName == null) {
                print "No preview available for '${projects[i]}'"
                continue
              }

              dir("apps/${projects[i]}") {
                // Run the yarn install in the app in cases of local packages.json
                if (fileExists("yarn.lock")) {
                  yarn.setup()
                }
              }

              stageWithNotify("Build and deploy PR for: ${projects[i]}") {
                def prefix = jenkinsHelpersUtil.determineRepoName()
                def domain = 'fusion-preview'
                previewServer(
                  repo: domain,
                  prefix: prefix,
                  buildCommand: "yarn build preview ${projects[i]}",
                  buildFolder: 'build',
                )
                deleteComments('[FUSION_PREVIEW_URL]')
                deleteComments('[pr-server]')
                def url = "https://fusion-pr-preview.cogniteapp.com/?externalOverride=${packageName}&overrideUrl=https://${prefix}-${env.CHANGE_ID}.${domain}.preview.cogniteapp.com/index.js"
                pullRequest.comment("[FUSION_PREVIEW_URL] Use cog-appdev as domain. Click here to preview: [$url]($url)")
              }
            }
          }
        },

        'Release': {
          container('fas') {
            if (isPullRequest) {
              print 'No FAS deploy on PR branch'
              return;
            }

            def projects = getAffectedProjects(isPullRequest, isMaster, isRelease) 

            for (int i = 0; i < projects.size(); i++) {
              def productionAppId = PRODUCTION_APP_IDS[projects[i]];

              if (productionAppId == null) {
                print "No release available for '${projects[i]}'"
                continue;
              }

              dir("apps/${projects[i]}") {
                // Run the yarn install in the app in cases of local packages.json
                if (fileExists("yarn.lock")) {
                  yarn.setup()
                }
              }

              stageWithNotify("Publish production build: ${projects[i]}") {
                fas.build(
                  appId: productionAppId,
                  repo: APPLICATION_REPO_ID,
                  buildCommand: "yarn build production ${projects[i]}",
                  shouldPublishSourceMap: false
                )

                fas.publish(
                  shouldPublishSourceMap: false
                )

                slack.send(
                  channel: SLACK_CHANNEL,
                  message: "Deployment of ${env.BRANCH_NAME} complete for '${projects[i]}'!"
                )
              }
            }
          }
        }
      )
    }
  }
}
