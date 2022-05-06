const fetch = require('node-fetch');
const spawn = require('cross-spawn');
const path = require('path');

module.exports = async function (options) {
  const remoteTranslations = await fetch(
    `https://api.locize.app/${options.projectId}/${options.version}/en/${options.namespace}`
  ).then((rawResponse) => rawResponse.json());
  if (!remoteTranslations) {
    throw new Error('remote translations are not found');
  }

  const localTranslationsPath = path.resolve(
    options.path,
    'en',
    `${options.namespace}.json`
  );
  let localTranslations;
  try {
    localTranslations = require(localTranslationsPath);
  } catch (error) {
    throw new Error(
      `en translations are not found in path "${localTranslationsPath}", make sure you provided the correct --path option`
    );
  }
  if (!localTranslations) {
    throw new Error('en translation file is empty');
  }

  let keysToRemove = Object.keys(remoteTranslations).filter((localKey) => {
    return !localTranslations[localKey];
  });
  if (keysToRemove.length === 0) {
    console.log('found no key to remove from remote');
    return;
  }

  console.log(`keys will removed from remote: ${keysToRemove.join(', ')}`);
  keysToRemove.forEach((key) => {
    spawn.sync(
      'yarn',
      [
        'locize',
        'remove',
        '--api-key',
        options.apiKey,
        '--project-id',
        options.projectId,
        '--ver',
        options.version,
        options.namespace,
        key,
      ],
      { encoding: 'utf8', stdio: 'inherit' }
    );
  });
};
