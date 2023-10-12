const { composePlugins, withNx } = require('@nrwl/webpack');
const { filterEnvVars } = require('../../tools/webpack/filter-env-vars');

module.exports = composePlugins(withNx(), filterEnvVars(), (config) => {
  console.log(
    'Web workers webpack config was loaded (' + process.env.NODE_ENV + ')'
  );
  config.context = __dirname;
  config.optimization.minimize = true;
  config.mode = 'production';
  config.target = 'webworker';

  config.output = {
    ...config.output,
    crossOriginLoading: 'anonymous',
    publicPath: 'auto',
  };

  return {
    ...config,
    plugins: [...config.plugins],
    // react scripts are causing a lot of errors to be throw in console (Failed to parse source map from...)
    // https://github.com/facebook/create-react-app/discussions/11767
    ignoreWarnings: [/Failed to parse source map/],
  };
});
