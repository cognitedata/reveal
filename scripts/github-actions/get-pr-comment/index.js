const { setFailed, setOutput, getInput, info } = require('@actions/core');
var fetch = require('node-fetch');

const run = async () => {
  try {
    const project = getInput('project');
    const prNumber = getInput('prNumber');
    const previewPackageName = getInput('previewPackageName');
    const storybook = getInput('storybook');

    let message = '';
    if (storybook) {
      message = `Storybook preview for **${project}** available at https://storybook-${project}-${prNumber}.fusion-preview.preview.cogniteapp.com
        <br><br>![AppBadge](https://img.shields.io/static/v1?label=Storybook&message=${project}&labelColor=FF4586)`;
    } else if (previewPackageName) {
      if (project === 'fusion-shell') {
        // temporary solution until we migrate login app in the monorepo
        const loginAppUrl = await fetch(
          'https://cog-demo.fusion.cognite.com/import-map.json'
        )
          .then((res) => res.json())
          .then(
            (fusionImportMaps) =>
              fusionImportMaps.imports['@cognite/login-page']
          );
        message = `Build preview for **${project}** available at https://${project}-${prNumber}.fusion-preview.preview.cogniteapp.com/?externalOverride=@cognite/login-page&overrideUrl=https://cog-demo.fusion.cognite.com/${loginAppUrl}
          <br><br>![AppBadge](https://img.shields.io/static/v1?label=Application&message=${project}&labelColor=2DB64C)`;
      } else {
        message = `Build preview for **${project}** available at https://fusion-pr-preview.cogniteapp.com/?externalOverride=${previewPackageName}&overrideUrl=https://${project}-${prNumber}.fusion-preview.preview.cogniteapp.com/index.js
        <br><br>![AppBadge](https://img.shields.io/static/v1?label=Application&message=${project}&labelColor=2DB64C)`;
      }
    } else {
      message = `Build preview for **${project}** available at https://${project}-${prNumber}.fusion-preview.preview.cogniteapp.com
        <br><br>![AppBadge](https://img.shields.io/static/v1?label=Application&message=${project}&labelColor=2DB64C)`;
    }

    info(`message: \n ${message}`);
    setOutput('message', message);
  } catch (error) {
    if (error instanceof Error || typeof error === 'string') {
      setFailed(error);
    } else {
      setFailed('Unknown error occured.');
    }
  }
};

run();
