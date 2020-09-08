export default {
  env: process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development',
  api: {
    url: 'https://subsurface-console-cognitedata-development.cognite.ai',
  },
  app: {
    baseUrl: process.env.REACT_APP_BASE_URL as string,
  },
  auth: {
    appId: 'Cognuit',
    appVersion: '1.0.0',
    cdfProject: 'subsurface-test',
    baseUrl: 'https://api.cognitedata.com',
  },
};
