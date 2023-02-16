const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  console.log('Starting dev env', process.env.NODE_ENV);
  app.use(
    '/login/status',
    createProxyMiddleware({
      target: 'http://localhost:4002',
      changeOrigin: true,
      secure: false,
    })
  );
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:4002',
      changeOrigin: true,
      secure: false,
    })
  );
};
