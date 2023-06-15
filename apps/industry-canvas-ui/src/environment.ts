export const environment = {
  APP_RELEASE_ID:
    process.env.REACT_APP_RELEASE_ID ||
    process.env.NX_REACT_APP_RELEASE_ID ||
    '',
  SENTRY_DSN:
    process.env.SENTRY_DSN ||
    process.env.NX_SENTRY_DSN ||
    'https://813bcfd6e12f4c6c8559fc4eddbc4faa@o124058.ingest.sentry.io/4504167830913024',
  SENTRY_PROJECT_NAME:
    process.env.SENTRY_PROJECT_NAME ||
    process.env.NX_SENTRY_PROJECT_NAME ||
    'industry-canvas-ui',
};
