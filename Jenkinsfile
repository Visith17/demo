@Library('jenkins-pipeline-lib') _
def ci = ciUtils() // import all ci utils
def cd = cdUtils() // import all cd utils
def msg = msgUtils() // import all notification utils

def telegramBotToken = "7146937545:AAHXsCAE0g2ASVQkSgQbaRvE8ktQd91xnl4"//credentials('telegram-bot-token') // store securely in Jenkins
def telegramChatId = '-1003468417171' // your group or channel ID

pipeline {

  agent { label 'built-in' }

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

    stage('Clone Helm Common Lib') {
        when { expression { params.DRY_RUN } }
        steps {
          sshagent (credentials: ['test-git-ssh-key']) {
            sh '''
              mkdir -p ~/.ssh
              ssh-keyscan gitlab.com >> ~/.ssh/known_hosts
              chmod 644 ~/.ssh/known_hosts
  
              git clone git@gitlab.com:devops2423143/helm-common-lib.git
  
              cd helm-common-lib

              export HOME=/home/jenkins
              export YQ_NO_CONFIG=1
              yq -i "
                .image.repository = \"${IMAGE_NAME}\" |
                .image.tag = \"${IMAGE_TAG}\"
              " values.yaml

              helm install demo-service ./demo-service -n ${env.NAMESPACE}
            '''
          }

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
      // script {
      //     sh "rm -rf helm-common-lib || true"
      //   }
    }
  }
}
