const { setFailed, setOutput, getInput, info } = require('@actions/core');

const run = async () => {
  try {
    const firebaseProjectId =
      getInput('firebaseProjectId') || 'fusion-217032465111';
    const environment = getInput('environment');

    const projectId = `${firebaseProjectId}${
      environment === 'production' ? '' : `-${environment}`
    }`;

    info(`projectId: ${projectId}`);
    setOutput('projectId', projectId);
  } catch (error) {
    if (error instanceof Error || typeof error === 'string') {
      setFailed(error);
    } else {
      setFailed('Unknown error occured.');
    }
  }
};

run();
