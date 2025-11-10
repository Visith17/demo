@Library('jenkins-pipeline-lib') _
def ci = ciPipeline() // now you control all ci logic
def cd = cdPipeline() // now you control all cd logic

pipeline {

  agent { label 'builder' }

  options {
      timestamps()
      timeout(time: 60, unit: 'MINUTES')
  }

  parameters {
       booleanParam(name: 'DRY_RUN', defaultValue: false, description: 'Dry run only')
  }

  environment {
    REGISTRY_TYPE = 'dockerhub' // 3 options: ecr, dockerhub and nexus
    AWS_REGION  = 'ap-southeast-1' // replace with your regin only you choose ecr
    CONTAINER_REGISTRY_CREDENTIALS = 'dockerhub-credentials' // replace with your credentials
    CONTAINER_REGISTRY = '' // replace with your registry name
    IMAGE_NAME = 'visith96/smtp-api' // replace with your image name
    STATIC_ENV = 'false' // if false vault not required
    VAULT_ADDR  = 'https://vault.vai247.pro' // replace with your vault host address only if you store you env on vault
    VAULT_CREDENTIALS = 'vault_token' // replace with your credentials only if you store you env on vault
  }

  stages {

    stage('Extract Commit & Generate Image Tag') {
      steps {
        checkout scm
        script {
            ci.git.setupGitSafeDir(this)
            ci.git.populateEnv(this, env)

            echo """
            ────────────── Commit Info ──────────────
            Branch       : ${env.BRANCH_NAME}
            Env          : ${env.TARGET_ENV}
            Commit       : ${env.GIT_COMMIT}
            Short Commit : ${env.SHORT_COMMIT}
            Image Tag    : ${env.IMAGE_TAG}
            Full Image   : ${env.FULL_IMAGE}
            ─────────────────────────────────────────
            """
        }
      }
    }

    stage('Retrieve env from Vault') {
      when { expression { env.STATIC_ENV == "true" } }
      steps {
        script {
          def secrets = ci.vault.fetchSecrets(this)
          if (secrets) {
            env.ADDITIONAL_ARGS = ci.vault.formatBuildArgs(secrets)
          }
        }
      }
    }

    stage('Build & Push Image') {
      steps {
        script {
          ci.docker.buildAndPush(this, env)
        }
      }
    }

    stage('Resolve Last Built Image') {
      steps {
        script {
          ci.docker.resolveLatestImageTag(this, env)
        }
      }
    }
  }
  post {
      success {
        echo "✅ Build succeeded"
      }
      failure {
        echo "❌ Build failed"
      }
      always {
        cleanWs()
      }
    }
}
