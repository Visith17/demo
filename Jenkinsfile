@Library('jenkins-pipeline-lib') _
def ci = ciPipeline()
def cd = cdPipeline()
def msg = msgPipeline()

def telegramBotToken = "7146937545:AAHXsCAE0g2ASVQkSgQbaRvE8ktQd91xnl4"//credentials('telegram-bot-token') // store securely in Jenkins
def telegramChatId = '997888556' // your group or channel ID
pipeline {

  agent any

  options {
    timestamps()
    timeout(time: 60, unit: 'MINUTES')
  }

  parameters {
    booleanParam(name: 'DRY_RUN', defaultValue: false, description: 'Dry run only')
  }

  environment {
    REGISTRY_TYPE = 'dockerhub'
    CONTAINER_REGISTRY_CREDENTIALS = 'dockerhub-credentials'
    CONTAINER_REGISTRY = ''
    IMAGE_NAME = 'visith96/smtp-api'
    DEPLOYMENT = 'demo-app'
    CONTAINER = 'demo-app'
    NAMESPACE = 'test'
  }
  
  stages {

    stage('Init') {
      steps {
        script {
          echo "🔧 Initializing kubectl-based deployment pipeline"
          env.FULL_IMAGE = ci.docker.resolveLatestImageTag(this, env)
          echo "Resolved latest image: ${env.FULL_IMAGE}"
        }
      }
    }

    stage('Deployment') {
      when { expression { !params.DRY_RUN } }
      steps {
        script {

          echo "🚀 Deploying ${env.FULL_IMAGE} to ${env.NAMESPACE}"

          try {
            cd.kube.deployImage(
              this,
              env.DEPLOYMENT,                         // Deployment name
              env.CONTAINER,                          // Container name
              env.NAMESPACE,                          // Namespace
              env.FULL_IMAGE,                         // Image tag
              "",//'http://${env.DEPLOYMENT}.${env.NAMESPACE}.svc.cluster.local:5000/healthz', // Health URL. Adjust port accordingly
              3,                                      // Retries for health checking 
              10                                      // Delay between retries
            )
            msg.telegram.sendDeploymentNotification(
              this,
              telegramBotToken,
              telegramChatId,
              'SUCCESS',
              env.DEPLOYMENT,
              env.FULL_IMAGE,
              env.NAMESPACE,
              'staging',
              env.BUILD_URL
            )
          } catch (err) {
            msg.telegram.sendDeploymentNotification(
              this,
              telegramBotToken,
              telegramChatId,
              'FAILED',
              env.DEPLOYMENT,
              env.FULL_IMAGE,
              env.NAMESPACE,
              'staging',
              env.BUILD_URL
            )
            throw err
          }
                    
        }
      }
    }

  }

  post {
    success {
      echo "✅ Deployment succeeded"
    }
    failure {
      echo "❌ Rollout failed"
    }
    always {
      cleanWs()
    }
  }
}
