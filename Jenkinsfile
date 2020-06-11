@Library('jenkins-helpers') _

static final String STAGING_DOMAIN_NAME = "tenant-selector.cognite.ai"
static final String RELEASE_DOMAIN_NAME = "tenant-selector-prod.cognite.ai"
static final String SENTRY_PROJECT_NAME = "tenant-selector"
static final String SENTRY_DSN = "https://4558e4f6faaf4948ab9327457827a301@o124058.ingest.sentry.io/5193370"
static final String LOCIZE_PROJECT_ID = "dfcacf1f-a7aa-4cc2-94d7-de6ea4e66f1d"

static final String PR_COMMENT_MARKER = "[pr-server]\n"
static final String STORYBOOK_COMMENT_MARKER = "[storybook-server]\n"

def pods = { body ->
  final String NODE_VERSION = 'node:12'
  fas.pod(
    nodeVersion: NODE_VERSION,
    sentryProjectName: SENTRY_PROJECT_NAME,
    sentryDsn: SENTRY_DSN,
    locizeProjectId: LOCIZE_PROJECT_ID
  ) {
    yarn.pod(
      nodeVersion: NODE_VERSION
    ) {
      previewServer.pod(
        nodeVersion: NODE_VERSION
      ) {
        properties([buildDiscarder(logRotator(daysToKeepStr: '30', numToKeepStr: '20'))])
        node(POD_LABEL) {
          def gitCommit
          def contexts = [
            checkout: "continuous-integration/jenkins/checkout",
            setup: "continuous-integration/jenkins/setup",
            lint: "continuous-integration/jenkins/lint",
            unitTests: "continuous-integration/jenkins/unit-tests",
            preview: "continuous-integration/jenkins/preview",
            storybook: "continuous-integration/jenkins/storybook",
            buildStaging: "continuous-integration/jenkins/build-staging",
            publishStaging: "continuous-integration/jenkins/publish-staging",
            buildRelease: "continuous-integration/jenkins/build-release",
            publishRelease: "continuous-integration/jenkins/publish-release",
          ]

          dir('main') {
            stageWithNotify('Checkout code', contexts.checkout) {
              checkout(scm)
            }
          }

          // Copy these before installing dependencies so that we don't have to
          // copy the entire node_modules directory tree as well.
          final String[] DIRS = [
            'lint',
            'testcafe',
            'unit-tests',
            'storybook',
            'preview',
            'staging',
            'release',
          ]

          stage('Copy folders') {
            DIRS.each({
              sh("cp -r main ${it}")
            })
          }

          dir('main') {
            stageWithNotify('Install dependencies', contexts.setup) {
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

          body(contexts)
        }
      }
    }
  }
}

pods { contexts ->
  def isReleaseBranch = env.BRANCH_NAME == "master"
  def isPullRequest = !!env.CHANGE_ID

  threadPool(
    tasks: [
      'Lint': {
        stageWithNotify('Check linting', contexts.lint) {
          dir('lint') {
            container('fas') {
              sh('yarn lint')
            }
          }
        }
      },
      'Unit tests': {
        stageWithNotify('Execute unit tests', contexts.unitTests) {
          dir('unit-tests') {
            container('fas') {
              sh('yarn test')
            }
          }
        }
      },
      'Storybook': {
        stageWithNotify('Storybook', contexts.storybook) {
          if (!isPullRequest) {
            print "Preview storybooks only work for PRs"
            return
          }
          dir('storybook') {
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
        stageWithNotify('Preview', contexts.preview) {
          if (!isPullRequest) {
            print "No PR previews for release builds"
            return
          }
          dir('preview') {
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
        stageWithNotify('Build for staging', contexts.buildStaging) {
          if (isPullRequest) {
            print "No staging builds for PRs"
            return
          }

          dir('staging') {
            fas.build(
              useContainer: true,
              domainName: STAGING_DOMAIN_NAME,
              iap: true,
              buildCommand: 'yarn build staging',
            )
          }
        }
      },
      'Release': {
        stageWithNotify('Build for release', contexts.buildRelease) {
          if (isPullRequest) {
            print "No release builds for PRs"
            return
          }

          dir('release') {
            fas.build(
              useContainer: true,
              domainName: RELEASE_DOMAIN_NAME,
              iap: false,
              buildCommand: 'yarn build production',
            )
          }
        }
      }
    ],
    workers: 2,
  )

  if (isReleaseBranch) {
    stageWithNotify('Publish staging', contexts.publishStaging) {
      dir('staging') {
        fas.publish(
          useContainer: true,
        )
      }
    }
    stageWithNotify('Publish release', contexts.publishRelease) {
      dir('release') {
        fas.publish(
          useContainer: true,
        )
      }
    }
  }
}
