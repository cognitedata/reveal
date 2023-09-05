const {
  setFailed,
  setOutput,
  getInput,
  info,
  getBooleanInput,
} = require('@actions/core');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

function getFusionSubAppPreviewPackageName(app) {
  try {
    const content = readFileSync(
      resolve(__dirname, '../../../apps', app, 'project.json'),
      'utf-8'
    );
    const projectConfig = JSON.parse(content.toString('utf-8'));
    if (projectConfig.pipeline) {
      return projectConfig.pipeline.previewPackageName || null;
    }
    return null;
  } catch {
    return null;
  }
}

function getAffectedSorted() {
  const affected = JSON.parse(getInput('affected'));
  return affected.sort();
}

function generateBadge(name, url, label, colorAsHex) {
  return `[![AppBadge](https://img.shields.io/static/v1?label=${encodeURIComponent(
    label
  )}&message=${encodeURIComponent(name)}&labelColor=${colorAsHex})](${url})`;
}

const PREVIEW_BASE_URL = 'fusion-preview.preview.cogniteapp.com';

function createAppComment(prNumber) {
  const affected = getAffectedSorted();
  const apps = affected.map((app) => {
    const previewPackageName = getFusionSubAppPreviewPackageName(app);
    const previewUrl = `https://${app}-${prNumber}.${PREVIEW_BASE_URL}`;
    const url = !!previewPackageName
      ? `https://fusion-pr-preview.cogniteapp.com/?externalOverride=${previewPackageName}&overrideUrl=${previewUrl}/index.js`
      : previewUrl;
    return generateBadge(app, url, 'Application', '2DB64C');
  });
  return ['## Build previews:', apps.join(' ')].join('\n');
}

function createShellAppComment(prNumber) {
  const affected = getAffectedSorted();
  const apps = affected.map((app) => {
    const url = `https://${app}-${prNumber}.${PREVIEW_BASE_URL}`;
    return generateBadge(app, url, 'Application', '2DB64C');
  });
  return ['## Build previews for shells:', apps.join(' ')].join('\n');
}

function createStorybookComment(prNumber) {
  const affected = getAffectedSorted();
  const storybooks = affected.map((app) => {
    const url = `https://storybook-${app}-${prNumber}.${PREVIEW_BASE_URL}`;
    return generateBadge(app, url, 'Storybook', 'FF4586');
  });
  return ['## Storybook previews:', storybooks.join(' ')].join('\n');
}

const run = async () => {
  try {
    const prNumber = getInput('prNumber');
    const shell = getBooleanInput('shell');
    const storybook = getInput('storybook');

    let message = '';
    if (storybook) {
      message = createStorybookComment(prNumber);
    } else if (shell) {
      message = createShellAppComment(prNumber);
    } else {
      message = createAppComment(prNumber);
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
