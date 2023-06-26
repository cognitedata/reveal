const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  const nodeEnv = process.env.NODE_ENV || 'production';
  console.log(`Custom webpack config(${nodeEnv}) for FDX was loaded...`);

  config.resolve.fallback = { path: require.resolve('path-browserify') };

  return config;
});
