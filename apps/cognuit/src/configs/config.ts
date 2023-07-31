export default {
  env: process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development',
  app: {
    baseUrl: process.env.REACT_APP_BASE_URL as string,
    version: '0.1.2',
  },
};
