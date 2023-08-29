const spawn = require('cross-spawn');

module.exports = function (options) {
  if (!options.apiKey) {
    throw new Error('environment variable is missing: LOCIZE_API_KEY');
  }

  spawn.sync(
    'yarn',
    [
      'locize',
      'save-missing',
      '--project-id',
      options.projectId,
      '--namespace',
      options.namespace,
      '--ver',
      options.version,
      '--path',
      options.path,
    ],
    { encoding: 'utf8', stdio: 'inherit' }
  );
};
