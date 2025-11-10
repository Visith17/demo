@Library('jenkins-pipeline-lib') _
def ci = ciPipeline()
def cd = cdPipeline()

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

          // Apply new image
          sh """
            kubectl set image deployment/${env.DEPLOYMENT} \
              ${env.CONTAINER}=${env.FULL_IMAGE} \
              -n ${env.NAMESPACE}
          """

          echo "⏳ Waiting for rollout to complete..."
          def rolloutStatus = sh(
            script: "kubectl rollout status deployment/${env.DEPLOYMENT} -n ${env.NAMESPACE} --timeout=60s || echo 'failed'",
            returnStdout: true
          ).trim()

          if (!rolloutStatus.contains('successfully rolled out')) {
            error("❌ Rollout failed or timed out for ${env.DEPLOYMENT}")
          }

          echo "✅ Rollout completed successfully"
        }
      }
    }

    stage('Post-Deployment Health Check') {
      when { expression { !params.DRY_RUN } }
      steps {
        script {
          echo "🔍 Running post-deployment health check..."

          def unhealthyPods = sh(
            script: """
              kubectl get pods -n ${env.NAMESPACE} \
                -l app=${env.CONTAINER} \
                --field-selector=status.phase!=Running \
                --no-headers | wc -l
            """,
            returnStdout: true
          ).trim()

          if (unhealthyPods != '0') {
            error("❌ Health check failed: found ${unhealthyPods} unhealthy pods.")
          }

          echo "✅ All pods are healthy after deployment."
        }
      }
    }
  }

  post {
    success {
      echo "✅ Deployment succeeded"
    }

    failure {
      script {
        echo "⚠️ Deployment or health check failed — initiating rollback..."
        try {
          sh """
            kubectl rollout undo deployment/${env.DEPLOYMENT} -n ${env.NAMESPACE}
          """
          echo "🔁 Rollback completed successfully."
        } catch (err) {
          echo "❌ Rollback failed: ${err}"
        }
      }
    }

    always {
      cleanWs()
    }
  }
}
