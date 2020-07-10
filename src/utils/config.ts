import { stringToBoolean } from './functions';

export default {
  env: process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development',
  api: {
    url: 'https://subsurface-console-cognitedata-development.cognite.ai',
    key: process.env.REACT_APP_API_KEY as string,
  },
  app: {
    autoLogin: stringToBoolean(process.env.REACT_APP_AUTO_LOGIN as string),
    baseUrl: process.env.REACT_APP_BASE_URL as string,
  },
  auth: {
    appId: 'Cognuit',
    appVersion: '1.0.0',
    cdfProject: 'publicdata',
    baseUrl: 'https://api.cognitedata.com',
  },
};
