const { setFailed, setOutput, getInput, info } = require('@actions/core');

const run = async () => {
  try {
    const environment = getInput('environment');
    const project = getInput('project');
    const firebaseSite = getInput('firebaseSite');
    const firebaseProdExtension = getInput('firebaseSite') || 'prod';
    const firebaseProjectId =
      getInput('firebaseProjectId') || 'fusion-217032465111'; // default firebase project id

    const extension =
      environment === 'production' ? firebaseProdExtension : environment;

    const site = firebaseSite
      ? `${firebaseSite}-${extension}`
      : `cdf-${project}-${extension}`;

    const projectId = `${firebaseProjectId}${
      environment === 'production' ? '' : `-${environment}`
    }`;

    info(`projectId: ${projectId}`);
    setOutput('projectId', projectId);

    info(`site: ${site}`);
    setOutput('site', site);
  } catch (error) {
    if (error instanceof Error || typeof error === 'string') {
      setFailed(error);
    } else {
      setFailed('Unknown error occured.');
    }
  }
};

run();
