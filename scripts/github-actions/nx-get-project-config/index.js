const { execSync } = require('child_process');

const { setFailed, setOutput, getInput, info } = require('@actions/core');

const run = async () => {
  try {
    const project = getInput('project') || 'data-exploration';
    const projectConfigRaw = execSync(
      `npx nx show project ${project}`
    ).toString('utf-8');
    const projectConfig = JSON.parse(projectConfigRaw);

    console.log(projectConfigRaw);
    console.log(projectConfig);
    info(`NX project config: ${projectConfigRaw}`);

    setOutput('config', projectConfig);
  } catch (error) {
    if (error instanceof Error || typeof error === 'string') {
      setFailed(error);
    } else {
      setFailed('Unknown error occured.');
    }
  }
};

run();
