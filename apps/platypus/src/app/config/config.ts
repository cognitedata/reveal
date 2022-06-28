export default {
  APP_APP_ID:
    process.env.REACT_APP_APP_ID ||
    process.env.NX_REACT_APP_APP_ID ||
    'platypus',
  APP_RELEASE_ID:
    process.env.REACT_APP_RELEASE_ID ||
    process.env.NX_REACT_APP_RELEASE_ID ||
    '',
  APP_VERSION_SHA:
    process.env.REACT_APP_VERSION_SHA ||
    process.env.NX_REACT_APP_VERSION_SHA ||
    '',
  APP_VERSION_NAME:
    process.env.REACT_APP_VERSION_NAME ||
    process.env.NX_REACT_APP_VERSION_NAME ||
    '',
  PUBLIC_URL: process.env.PUBLIC_URL || process.env.NX_PUBLIC_URL || '',
  SENTRY_DSN:
    process.env.SENTRY_DSN ||
    process.env.NX_SENTRY_DSN ||
    'https://b37a75c7e26440009d63602ba2f02b9f@o124058.ingest.sentry.io/5996992',
  SENTRY_PROJECT_NAME:
    process.env.SENTRY_PROJECT_NAME ||
    process.env.NX_SENTRY_PROJECT_NAME ||
    'platypus',
  MIXER_API_GROUP_NAME: 'schema',
  DMS_API_GROUP_NAME: 'datamodelstorage',
};
