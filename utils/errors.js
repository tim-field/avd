import * as Sentry from "@sentry/browser"

const SENTRY_DSN = process.env.SENTRY_DSN

const sentryIsActive = !!SENTRY_DSN

if (sentryIsActive) {
  Sentry.init({
    dsn: SENTRY_DSN
  })
}

export const captureError = (error, errorInfo) => {
  if (sentryIsActive) {
    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key])
      })
      Sentry.captureException(error)
    })
  }
}

export const showReportDialog = () => {
  if (sentryIsActive) {
    Sentry.showReportDialog()
  }
}

export const haveReportDialog = () => sentryIsActive
