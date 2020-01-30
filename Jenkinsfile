@Library('jenkins-helpers@fas') _

static final String REPO = "fas-demo-app"
static final String PR_COMMENT_MARKER = "[pr-server]\n"
// If you need separate staging / production / etc URLs, then you'll have to do
// switches in the code down below.
static final String DOMAIN_NAME = "fas-demo.cognite.ai"

def label = "${REPO}-${UUID.randomUUID().toString().substring(0, 5)}"
podTemplate(
  label: label,
  containers: [
    containerTemplate(
      name: 'node',
      image: 'node:12',
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
      resourceRequestCpu: '2000m',
      resourceRequestMemory: '2500Mi',
      resourceLimitCpu: '2000m',
      resourceLimitMemory: '2500Mi',
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
    def isPullRequest = !!env.CHANGE_ID
    stage('Checkout code') {
      checkout(scm)
    }
    container('node') {
      stage('Install dependencies') {
        sh('cp /npm-credentials/npm-public-credentials.txt ~/.npmrc')
        // Yarn can fail sometimes, so let's just retry it a few times.
        retry(5) {
          sh('yarn')
        }
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
          sh('yarn lint')
        },
        'Execute tests': {
          sh('yarn test')
        },
        'PR preview': {
          if (!isPullRequest) {
            print "No PR previews for release builds"
            return
          }
          sh('yarn build');
          deployPrServer(
            commentPrefix: PR_COMMENT_MARKER,
          )
        },
        'Release build': {
          if (isPullRequest) {
            print "No release builds for PRs"
            return
          }
          fasBuild(
            GOOGLE_APPLICATION_CREDENTIALS: env.FAS_APPLICATION_CREDENTIALS,
            domainName: DOMAIN_NAME
            iap: true,
            buildCommand: 'yarn build',
          )
        }
      )

      if (isPullRequest) {
        fasPublish()
      }
    }
  }
}
