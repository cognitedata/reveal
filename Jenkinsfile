@Library('jenkins-helpers@fas-12') _

static final String STAGING_DOMAIN_NAME = "tenant-selector.cognite.ai"
static final String RELEASE_DOMAIN_NAME = "production.tenant-selector.cognite.ai"
static final String SENTRY_PROJECT_NAME = "tenant-selector"

static final String PR_COMMENT_MARKER = "[pr-server]\n"
static final String STORYBOOK_COMMENT_MARKER = "[storybook-server]\n"

def label = [
  jenkinsHelpersUtil.determineRepoName(),
  UUID.randomUUID().toString().substring(0, 5)
].join("-")

podTemplate(
  label: label,
  containers: []
    .plus(
      fas.containers(
        sentryProjectName: SENTRY_PROJECT_NAME
      )
    )
    .plus(previewServer.containers())
    .plus(yarn.containers()),
  envVars: [],
  volumes: []
    .plus(yarn.volumes())
    .plus(fas.volumes())
    .plus(previewServer.volumes())
) {
  properties([buildDiscarder(logRotator(daysToKeepStr: '30', numToKeepStr: '20'))])
  node(label) {
    def gitCommit
    def contexts = [
      checkout: "continuous-integration/jenkins/checkout",
      setup: "continuous-integration/jenkins/setup",
      lint: "continuous-integration/jenkins/lint",
      unitTests: "continuous-integration/jenkins/unit-tests",
      preview: "continuous-integration/jenkins/preview",
      storybook: "continuous-integration/jenkins/storybook",
      buildRelease: "continuous-integration/jenkins/build-release",
      publishRelease: "continuous-integration/jenkins/publish-release",
    ]

    def isStaging = env.BRANCH_NAME == "master"
    def isRelease = env.BRANCH_NAME.startsWith("release-")
    def isPullRequest = !!env.CHANGE_ID

    stageWithNotify('Checkout code', contexts.checkout) {
      checkout(scm)
    }

    stageWithNotify('Install dependencies', contexts.setup) {
      yarn.setup()
    }

    parallel(
      'Lint': {
        stageWithNotify('Check linting', contexts.lint) {
          container('fas') {
            sh('yarn lint')
          }
        }
      },
      'Unit tests': {
        stageWithNotify('Execute unit tests', contexts.unitTests) {
          container('fas') {
            sh('yarn test')
          }
        }
      },
      // For whatever reason, doing this in parallel tends to cause issues. The
      // current hypothesis is that they fight when they're in the same working
      // directory. Making separate working folders for this would help, but
      // that's an exercise for a later date.
      'Storybook + Preview': {
        stageWithNotify('Storybook', contexts.storybook) {
          if (!isPullRequest) {
            print "Preview storybooks only work for PRs"
            return
          }
          previewServer(
            buildCommand: 'yarn build-storybook',
            commentPrefix: STORYBOOK_COMMENT_MARKER,
            buildFolder: 'storybook-static',
            prefix: 'storybook',
          )
        }
        stageWithNotify('Preview', contexts.preview) {
          if (!isPullRequest) {
            print "No PR previews for release builds"
            return
          }
          previewServer(
            buildCommand: 'yarn build preview',
            commentPrefix: PR_COMMENT_MARKER,
            buildFolder: 'build',
            prefix: 'pr',
          )
        }
      },
      'Release': {
        stageWithNotify('Build for release', contexts.buildRelease) {
          if (isPullRequest) {
            print "No release builds for PRs"
            return
          }

          def domainName = isStaging ? STAGING_DOMAIN_NAME : RELEASE_DOMAIN_NAME
          def variant = isStaging ? 'staging' : 'production'

          fas.build(
            useContainer: 'fas-12',
            domainName: domainName,
            // Note: this should reflect the state of your app's deployment. In
            // general:
            //   staging deployments    => iap: true
            //   production deployments => iap: false
            // An easy way to test this is to go to your app's domain name in
            // an incognito window and see if you get hit with a Google login
            // screen straight away.
            iap: isStaging,
            buildCommand: "yarn build ${variant}",
          )
        }
      }
    )

    if (!isPullRequest) {
      stageWithNotify('Publish build', contexts.publishRelease) {
        fas.publish(
          useContainer: 'fas-12',
        )
      }
    }
  }
}
