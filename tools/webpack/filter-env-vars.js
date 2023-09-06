// https://github.com/nrwl/nx/issues/15767#issuecomment-1476080894

const filterEnvVars = () => (config) => {
  config.plugins = config.plugins.map((plugin) => {
    if (!plugin.definitions || !plugin.definitions['process.env']) {
      return plugin;
    }

    const allowedEnvVars = [
      'NODE_ENV',
      'SENTRY_DSN',
      'NX_SENTRY_DSN',
      'SENTRY_PROJECT_NAME',
      'NX_SENTRY_PROJECT_NAME',
      'PUBLIC_URL',
      'NX_PUBLIC_URL',
      'REACT_APP_ENV',
      'REACT_APP_VERSION',
      'REACT_APP_VERSION_SHA',
      'NX_REACT_APP_VERSION_SHA',
      'REACT_APP_LOCIZE_API_KEY',
      'NX_REACT_APP_LOCIZE_API_KEY',
      'REACT_APP_MIXPANEL_TOKEN',
      'REACT_APP_RELEASE_ID',
      'NX_REACT_APP_RELEASE_ID',
      'REACT_APP_APP_ID',
      'NX_REACT_APP_APP_ID',
      'REACT_APP_VERSION_NAME',
      'NX_REACT_APP_VERSION_NAME',
      'NX_REACT_APP_LOCAL_SERVICE',
      'MIXPANEL_TOKEN',
      'NX_TASK_TARGET_PROJECT',
      'REACT_APP_SENTRY_DSN',
      'NX_REACT_APP_ENV',
      'STORYBOOK',
      'FUSION_ENV',
      'NX_TASK_TARGET_CONFIGURATION',
    ];

    const env = plugin.definitions['process.env'] || {};
    const updatedEnv = Object.keys(env).reduce((acc, key) => {
      if (allowedEnvVars.includes(key)) {
        acc[key] = env[key];
      }
      return acc;
    }, {});

    plugin.definitions['process.env'] = updatedEnv;
    return plugin;
  });

  return config;
};

module.exports = { filterEnvVars };
