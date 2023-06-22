const spawn = require('cross-spawn');

module.exports = function (options) {
  spawn.sync(
    'yarn',
    [
      'locize',
      'download',
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
