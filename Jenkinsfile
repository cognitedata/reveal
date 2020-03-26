@Library('jenkins-helpers@fas-container') _

static final String REPO = "react-demo-app"
static final String PR_COMMENT_MARKER = "[pr-server]\n"
static final String STORYBOOK_COMMENT_MARKER = "[storybook-server]\n"
// If you need separate staging / production / etc URLs, then you'll have to do
// switches in the code down below.
static final String DOMAIN_NAME = "react-demo.cognite.ai"

def label = "${REPO}-${UUID.randomUUID().toString().substring(0, 5)}"
podTemplate(
  label: label,
  containers: []
    .plus(
      fas.containers(
        // Replace this with your app's ID on https://sentry.io/ -- if you do not
        // have one, then please get one. Stop by #frontend to ask for help.
        sentryProjectName: 'react-demo-app'
      )
    )
    .plus(previewServer.containers())
    .plus(yarn.containers()),
  envVars: [
    envVar(
      key: 'CHANGE_ID',
      value: env.CHANGE_ID
    ),
  ],
  volumes: []
    .plus(yarn.volumes())
    .plus(fas.volumes())
    .plus(previewServer.volumes())
) {
  properties([buildDiscarder(logRotator(daysToKeepStr: '30', numToKeepStr: '20'))])
  node(label) {
    def gitCommit
    def context_checkout = "continuous-integration/jenkins/checkout"
    def context_setup = "continuous-integration/jenkins/setup"
    def context_lint = "continuous-integration/jenkins/lint"
    def context_unitTests = "continuous-integration/jenkins/unit-tests"
    def context_buildPrPreview = "continuous-integration/jenkins/build-pr-preview"
    def context_buildRelease = "continuous-integration/jenkins/build-release"
    def context_publishRelease = "continuous-integration/jenkins/publish-release"
    def context_buildStorybook = "continuous-integration/jenkins/build-storybook"
    def context_publishStorybook = "continuous-integration/jenkins/publish-storybook"

    def isPullRequest = !!env.CHANGE_ID

    stageWithNotify('Checkout code', context_checkout) {
      checkout(scm)
    }

    stageWithNotify('Install dependencies', context_setup) {
      yarn.setup()
    }

    parallel(
      'Lint': {
        stageWithNotify('Check linting', context_lint) {
          container('fas') {
            sh('yarn lint')
          }
        }
      },
      'Unit tests': {
        stageWithNotify('Execute unit tests', context_unitTests) {
          container('fas') {
            sh('yarn test')
          }
        }
      },
      'Storybook': {
        stageWithNotify('Build storybook', context_buildStorybook) {
          if (!isPullRequest) {
            print "Preview storybooks only work for PRs"
            return
          }
          container('preview') {
            stage('Remove GitHub comments') {
              deleteComments(STORYBOOK_COMMENT_MARKER)
            }
            stage('Build') {
              sh('yarn build-storybook')
            }
          }
          stageWithNotify('Publish', context_publishStorybook) {
            previewServer.deployStorybook(
              useContainer: true,
              commentPrefix: STORYBOOK_COMMENT_MARKER,
            )
          }
        }
      },
      'Preview': {
        stageWithNotify('Build for PR', context_buildPrPreview) {
          if (!isPullRequest) {
            print "No PR previews for release builds"
            return
          }
          container('preview') {
            stage('Remove GitHub comments') {
              deleteComments(PR_COMMENT_MARKER)
            }
            stage('Perform build') {
              sh('yarn build')
            }
          }
          stageWithNotify('Publish build', context_publishRelease) {
            previewServer.deployApp(
              useContainer: true,
              commentPrefix: PR_COMMENT_MARKER,
            )
          }
        }
      },
      'Release': {
        stageWithNotify('Build for release', context_buildRelease) {
          if (isPullRequest) {
            print "No release builds for PRs"
            return
          }
          fas.build(
            useContainer: true,
            domainName: DOMAIN_NAME,
            // Note: this should reflect the state of your app's deployment. In
            // general:
            //   staging deployments    => iap: true
            //   production deployments => iap: false
            // An easy way to test this is to go to your app's domain name in
            // an incognito window and see if you get hit with a Google login
            // screen straight away.
            iap: true,
            buildCommand: 'yarn build',
          )
        }
      }
    )

    if (!isPullRequest) {
      stageWithNotify('Publish build', context_publishRelease) {
        fas.publish(
          useContainer: true,
        )
      }
    }
  }
}
