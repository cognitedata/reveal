@Library('jenkins-helpers') _
static final String NODE_VERSION = 'node:14'

def pods = { body ->
  yarn.pod(nodeVersion: NODE_VERSION) {
    podTemplate(
      containers: [
        containerTemplate(
          name: 'node',
          image: NODE_VERSION,
          ttyEnabled: true,
          envVars: [
            envVar(key: 'GOOGLE_APPLICATION_CREDENTIALS', value: '/jenkins-cdf-hub-deployer-v1/credentials.json'),
          ]
        )
      ],
      envVars: [
        envVar(key: 'CHANGE_ID', value: env.CHANGE_ID),
      ],
      volumes: []) {
      properties([
        
      ])
      node(POD_LABEL) {
        body()
      }
    }
  }
}
pods {
  def gitCommit
  def imageName
  def context

  def context_checkout = 'continuous-integration/jenkins/checkout'
  def context_dependencies = 'continuous-integration/jenkins/install-dependencies'
  def context_linting = 'continuous-integration/jenkins/linting'
  def context_unit_tests = 'continuous-integration/jenkins/unit-tests'
  def context_build = 'continuous-integration/jenkins/build'


  dir('main') {
    container('jnlp') {
      stageWithNotify('Checkout', context_checkout) {
        checkout(scm)
        gitCommit = sh(
          returnStdout: true,
          script: 'git rev-list --oneline --max-count=1 HEAD'
        ).trim()
      }
    }
  }

  dir('main') {
    stage('Install NPM credentials') {
      yarn.setup()
    }

    container('node') {
      stageWithNotify('Install dependencies', context_dependencies) {
        sh('yarn install --frozen-lockfile')
      }
    }

    container('node') {
      stageWithNotify('Build', context_build) {
        sh('yarn build');
      }
    }

    container('node') {
      stageWithNotify('Lint', context_build) {
        sh('yarn lint');
      }
    }

    // container('node') {
    //   stageWithNotify('Test', context_build) {
    //     sh('yarn test');
    //   }
    // }
  }
}
