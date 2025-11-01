@Library('jenkins-pipeline-lib') _
def ci = ciPipeline() // now you control all logic

pipeline {

  agent { label 'builder' }

  options {
      timestamps()
      timeout(time: 60, unit: 'MINUTES')
  }

  environment {
    CONTAINER_REGISTRY_CREDENTIALS = 'dockerhub-credentials'
    AWS_REGION  = 'ap-southeast-1'
    VAULT_ADDR  = 'https://vault.vai247.pro'
    VAULT_CREDENTIALS = 'vault_token'
  }

  stages {
    stage('Init') {
      steps {
        script {
          def config = [IMAGE_NAME: "visith96/smtp-api", REGISTRY_TYPE: "dockerhub", CONTAINER_REGISTRY: ""]
          echo "🔧 Custom pipeline"
        //   ci.git.validateConfig(this, [], ['REGISTRY_TYPE', 'IMAGE_NAME'])
          ci.env.populateEnv(this, env, config)
        }
      }
    }

    stage('Checkout & Tag') {
      steps {
        checkout scm
        script {
            ci.git.setupGitSafeDir(this)
            def gitInfo = ci.git.extractCommitInfo(this, env)
            env.TARGET_ENV   = gitInfo.targetEnv
            env.GIT_COMMIT   = gitInfo.commit
            env.SHORT_COMMIT = gitInfo.shortCommit
            env.IMAGE_TAG    = "${env.TARGET_ENV}-${BUILD_NUMBER}-${env.SHORT_COMMIT}"
            env.FULL_IMAGE   = env.REGISTRY_TYPE == "dockerhub" ? "${env.IMAGE_NAME}:${env.IMAGE_TAG}" : "${env.CONTAINER_REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
            ci.git.labelBuild(this, gitInfo)
            echo """
            ────────────── Commit Info ──────────────
            Branch       : ${env.BRANCH_NAME}
            Env          : ${env.TARGET_ENV}
            Commit       : ${env.GIT_COMMIT}
            Short Commit : ${env.SHORT_COMMIT}
            Image Tag    : ${env.IMAGE_TAG}
            Full Image   : ${env.FULL_IMAGE}
            Display name : ${currentBuild.displayName}
            Description  : ${currentBuild.description}
            ─────────────────────────────────────────
            """
        }
      }
    }

    // You are now FREE to define any custom steps, order, logic:
    stage('Build My App') {
      steps {
        script {
          sh 'echo "your customed stage..."'
        }
      }
    }

    stage('Build Image') {
      steps {
        script {
          ci.docker.buildAndPush(this, env)
        }
      }
    }
  }
}
