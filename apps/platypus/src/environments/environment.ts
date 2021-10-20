// This file can be replaced during build by using the `fileReplacements` array.
// When building for production, this file is replaced with `environment.prod.ts`.

export const environment = {
  production: false,
  APP_ENV: 'development',
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
};
