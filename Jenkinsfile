@Library('jenkins-helpers') _

static final String REPO = "react-demo-app"
static final String PR_COMMENT_MARKER = "[pr-server]\n"
// If you need separate staging / production / etc URLs, then you'll have to do
// switches in the code down below.
static final String DOMAIN_NAME = "react-demo.cognite.ai"

def label = "${REPO}-${UUID.randomUUID().toString().substring(0, 5)}"
podTemplate(
  label: label,
  containers: [
    containerTemplate(
      name: 'node',
      image: 'node:10',
      envVars: [
        envVar(key: 'CI', value: 'true'),
        envVar(key: 'NODE_PATH', value: 'src/'),
        secretEnvVar(
          key: 'PR_CLIENT_ID',
          secretName: 'pr-server-api-tokens',
          secretKey: 'client_id'
        ),
        secretEnvVar(
          key: 'PR_CLIENT_SECRET',
          secretName: 'pr-server-api-tokens',
          secretKey: 'client_secret'
        ),
      ],
      resourceRequestCpu: '1',
      resourceRequestMemory: '8Gi',
      resourceLimitCpu: '3',
      resourceLimitMemory: '16Gi',
      ttyEnabled: true
    )
  ],
  envVars: [
    envVar(
      key: 'CHANGE_ID',
      value: env.CHANGE_ID
    ),
    envVar(
      key: 'GOOGLE_APPLICATION_CREDENTIALS',
      value: '/google-credentials/credentials.json'
    ),
    // This is needed for the FAS utilities
    envVar(
      key: 'FAS_APPLICATION_CREDENTIALS',
      value: '/fas-credentials/credentials.json'
    ),
    envVar(
      key: 'SENTRY_ORG',
      value: 'cognite',
    ),
    envVar(
      key: 'SENTRY_PROJECT',
      value: 'react-demo-app'
    ),
    secretEnvVar(
      key: 'SENTRY_AUTH_TOKEN',
      secretName: 'sentry-auth-tokens',
      secretKey: 'releases'
    )
  ],
  volumes: [
    secretVolume(
      secretName: 'npm-credentials',
      mountPath: '/npm-credentials',
      readOnly: true
    ),
    secretVolume(
      secretName: 'crm-jenkins-google-credentials',
      mountPath: '/google-credentials',
      readOnly: true
    ),
    secretVolume(
      secretName: 'jenkins-fas-deployment-account',
      mountPath: '/fas-credentials',
      readOnly: true
    )
  ]) {
    properties([buildDiscarder(logRotator(daysToKeepStr: '30', numToKeepStr: '20'))])
    node(label) {
    def gitCommit
    def shortHash
    def context_checkout = "continuous-integration/jenkins/checkout"
    def context_setup = "continuous-integration/jenkins/setup"
    def context_lint = "continuous-integration/jenkins/lint"
    def context_unitTests = "continuous-integration/jenkins/unit-tests"
    def context_buildPrPreview = "continuous-integration/jenkins/build-pr-preview"
    def context_buildRelease = "continuous-integration/jenkins/build-release"
    def context_publishRelease = "continuous-integration/jenkins/publish-release"

    def isPullRequest = !!env.CHANGE_ID

    stageWithNotify('Checkout code', context_checkout) {
      checkout(scm)
      shortHash = sh(
        returnStdout: true,
        script: "git rev-parse --short HEAD"
      )
    }

    container('node') {
      stageWithNotify('Install dependencies', context_setup) {
        yarn()
      }
      if (isPullRequest) {
        // This needs to follow the delete-pr.sh step because we don't want to
        // remove the comments if the teardown didn't succeed.
        stage('Remove GitHub comments') {
          pullRequest.comments.each({
            if (it.body.startsWith(PR_COMMENT_MARKER) && it.user == "cognite-cicd") {
              pullRequest.deleteComment(it.id)
            }
          })
        }
      }

      parallel(
        'Check linting': {
          stageWithNotify('Check linting', context_lint) {
            sh('yarn lint')
          }
        },
        'Execute unit tests': {
          stageWithNotify('Execute unit tests', context_unitTests) {
            sh('yarn test')
          }
        },
        'Build for PR': {
          stageWithNotify('Build for PR', context_buildPrPreview) {
            if (!isPullRequest) {
              print "No PR previews for release builds"
              return
            }
            sh('yarn build');
            stageWithNotify('Publish build', context_publishRelease) {
              previewServer.deployApp(
                commentPrefix: PR_COMMENT_MARKER,
              )
            }
          }
        },
        'Build for release': {
          stageWithNotify('Build for release', context_buildRelease) {
            if (isPullRequest) {
              print "No release builds for PRs"
              return
            }
            fas.build(
              GOOGLE_APPLICATION_CREDENTIALS: env.FAS_APPLICATION_CREDENTIALS,
              domainName: DOMAIN_NAME,
              iap: true,
              buildCommand: 'yarn build',
              releaseName: "${env.BRANCH_NAME}-${shortHash}",
            )
          }
        }
      )

      if (!isPullRequest) {
        stageWithNotify('Publish build', context_publishRelease) {
          fas.publish(
            releaseName: "${env.BRANCH_NAME}-${shortHash}",
          )
        }
      }
    }
  }
}
