const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  const nodeEnv = process.env.NODE_ENV || 'production';
  console.log(
    `Custom webpack config(${nodeEnv}) for Coding Conventions was loaded...`
  );

  config.resolve.fallback = { path: require.resolve('path-browserify') };

  if (nodeEnv === 'development') {
    // Temp fix to devserver and hmr
    config.devServer.allowedHosts = 'all';
    config.devServer.headers['Access-Control-Allow-Origin'] = '*';
    config.devServer.https = true;
    config.devServer.port = 3010;

    config.devServer.static = {
      watch: {
        followSymlinks: true,
      },
    };
  }

  return config;
});
