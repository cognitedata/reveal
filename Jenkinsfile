@Library('jenkins-helpers') _

static final String PR_COMMENT_MARKER = "🚀[pr-server]\n"
static final String STORYBOOK_COMMENT_MARKER = "📖[storybook-server]\n"
previewServer.pod(nodeVersion: 'node:10') {
  podTemplate(
    containers: [
      containerTemplate(
        name: 'node',
        image: 'node:10',
        envVars: [
          envVar(key: 'CI', value: 'true'),
        ],
        resourceRequestCpu: '7000m',
        resourceRequestMemory: '7500Mi',
        resourceLimitCpu: '7000m',
        resourceLimitMemory: '7500Mi',
        ttyEnabled: true
      ),
      containerTemplate(
        name: 'cloudsdk',
        image: 'google/cloud-sdk:277.0.0',
        resourceRequestCpu: '500m',
        resourceRequestMemory: '500Mi',
        resourceLimitCpu: '500m',
        resourceLimitMemory: '500Mi',
        ttyEnabled: true,
        envVars: [
          envVar(key: 'GOOGLE_APPLICATION_CREDENTIALS', value: '/jenkins-cdf-hub-deployer/credentials.json'),
        ]
      )
    ],
    envVars: [
      envVar(key: 'CHANGE_ID', value: env.CHANGE_ID),
    ],
    volumes: [secretVolume(secretName: 'npm-credentials',
                           mountPath: '/npm-credentials',
                           defaultMode: '400'),
              secretVolume(secretName: 'jenkins-cdf-hub-deployer',
                           mountPath: '/jenkins-cdf-hub-deployer',
                           readOnly: true),
              hostPathVolume(hostPath: '/var/run/docker.sock', mountPath: '/var/run/docker.sock')]) {
    properties([buildDiscarder(logRotator(daysToKeepStr: '30', numToKeepStr: '20'))])
    node(POD_LABEL) {
      def gitCommit
      def gitAuthor
      def getTitle
      def isPullRequest = !!env.CHANGE_ID
      def bucketBundles = "cdf-hub-bundles"

      dir('main') {
        stage("Checkout code") {
          checkout(scm)
          gitCommit = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
          gitTitle = sh(returnStdout: true, script: "git show -s --format='%s' HEAD").trim()
          gitAuthor = sh(returnStdout: true, script: "git show -s --format='%ae' HEAD").trim()
        }
      }

      dir('main') {
        container('node') {
          stage('Install dependencies') {
            sh('cp /npm-credentials/npm-public-credentials.txt ~/.npmrc')
            retry(5) {
              sh('yarn')
              sh('yarn --cwd functions')
            }
          }
        }
      }
      parallel(
        'CI Checks and Test': {
          dir('main') {
            container('node') {
              stageWithNotify('CI Checks') {
                sh("yarn ci")
              }
              stageWithNotify('Unit tests') {
                sh("./bin/ci-run-unittest.sh test:once:unittests")
              }
              stageWithNotify('Performance regression tests') {
                sh("./bin/ci-run-unittest.sh test:once:performanceTests")
              }
            }
          }
        },
        'Build and Deploy':{
          dir('main') {
            if (isPullRequest) {
                stageWithNotify('Build and deploy PR') {
                  previewServer(
                    buildCommand: 'yarn build:preview',
                    prefix: 'pr',
                    buildFolder: 'build',
                    commentPrefix: PR_COMMENT_MARKER
                  )
                }
                stageWithNotify('Build and deploy Storybook') {
                  previewServer(
                    buildCommand: 'yarn build-storybook',
                    prefix: 'storybook',
                    buildFolder: 'storybook-static',
                    commentPrefix: STORYBOOK_COMMENT_MARKER
                  )
                }
            } else {
              container('node') {
                stage('Build') {
                  sh("yarn build")
                }
              }
              if (env.BRANCH_NAME == 'master') {
                container('cloudsdk') {
                  stageWithNotify('Deploy to cdf-hub') {
                    def timestamp = sh(returnStdout: true, script: 'date +"%Y.%m.%d"').trim()
                    sh("gcloud auth activate-service-account jenkins-cdf-hub-deployment@cognitedata.iam.gserviceaccount.com --key-file=/jenkins-cdf-hub-deployer/credentials.json --project=cognitedata-production")
                    // Upload the root config js to the bundles bucket
                    sh("gsutil cp -z html,css,js,map,svg,json -r build/. gs://${bucketBundles}/cognite-cdf-data-exploration/${timestamp}-${gitCommit}/")
                    sh("gsutil cp -z html,css,js,map,svg,json -r build/. gs://${bucketBundles}/cognite-cdf-data-exploration/latest/")
                    slackSend(channel: "#de-logs", message: "PR '${gitTitle}' by ${gitAuthor} merged and deployed to bundles bucket. It is available at https://cdf-hub-bundles.cogniteapp.com/cognite-cdf-data-exploration/${timestamp}-${gitCommit}/index.js and https://cdf-hub-bundles.cogniteapp.com/cognite-cdf-data-exploration/latest/index.js. Update https://github.com/cognitedata/cdf-hub/blob/staging/packages/root/static/import-map.json or https://github.com/cognitedata/cdf-hub/blob/release-production/packages/root/static/import-map.json to update staging or production. https://dev.fusion.cogniteapp.com should already be updated.")
                  }
                }
              }
            }
          }
        }
      )
    }
  }
}
