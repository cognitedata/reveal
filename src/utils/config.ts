export default {
  env: process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development',
  api: {
    url: 'https://subsurface-console-cognitedata-development.cognite.ai',
    project: '/subsurface',
    key: process.env.REACT_APP_API_KEY as string,
  },
};
