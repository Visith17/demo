@Library('jenkins-pipeline-lib') _
def ci = ciUtils() // import all ci utils
def cd = cdUtils() // import all cd utils
def msg = msgUtils() // import all notification utils

def telegramBotToken = "7146937545:AAHXsCAE0g2ASVQkSgQbaRvE8ktQd91xnl4"//credentials('telegram-bot-token') // store securely in Jenkins
def telegramChatId = '-1003468417171' // your group or channel ID

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
    IMAGE_TAG = 'prod-160-0c8f6af'
  }
  
  stages {

    stage('Init') {
      when { expression { !params.DRY_RUN } }
      steps {
        script {
          echo "🔧 Initializing kubectl-based deployment pipeline"
          env.FULL_IMAGE = ci.docker.resolveLatestImageTag(this, env)
          echo "Resolved latest image: ${env.FULL_IMAGE}"
        }
      }
    }

    stage('Checkout Helm Chart') {
        when { expression { params.DRY_RUN } }
        steps {
            def USERNAME = "@Visith17"
            def PASSWORD = "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"
          // withCredentials([usernamePassword(credentialsId: 'github-credentails', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
            sh """
              (
              git clone https://${USERNAME}:${PASSWORD}@gitlab.com/devops2423143/helm-common-lib.git
              cd helm-common-lib

              yq -i '
                .image.repository = ${env.IMAGE_NAME} |
                .image.tag = ${env.IMAGE_TAG}
              ' values.yaml
              
              helm install demo-service ./demo-service -n ${env.NAMESPACE}

              # yq e -i '.containers[] |= select(.name == "${env.SERVICE_NAME}").image.tag = "${env.IMAGE_TAG}"' ${env.TARGET_ENV}/${env.SERVICE_NAME}/values.yaml
              
              # git add .
              # git commit -am "Update ${env.SERVICE_NAME} image tag to ${env.IMAGE_TAG} on ${env.PROJECT} ${env.TARGET_ENV}"
              # git push origin main || (git pull --rebase origin main && git push origin main)
              )
            """
          // }
        }
      }

    stage('Deployment') {
      when { expression { !params.DRY_RUN } }
      steps {
        script {

          echo "🚀 Deploying ${env.FULL_IMAGE} to ${env.NAMESPACE}"
          msg.telegram.sendDeploymentNotification(
            this,
            telegramBotToken,
            telegramChatId,
            'STARTED',
            env.DEPLOYMENT,
            env.FULL_IMAGE,
            env.NAMESPACE,
            'staging',
            env.BUILD_URL
          )
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
      script {
          sh "rm -rf helm-common-lib || true"
        }
    }
  }
}
