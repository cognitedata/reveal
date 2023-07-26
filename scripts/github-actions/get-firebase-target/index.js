const { setFailed, setOutput, getInput, info } = require('@actions/core');

const run = async () => {
  try {
    const firebaseTarget = getInput('firebaseTarget');
    const environment = getInput('environment');
    const project = getInput('project');

    const target = firebaseTarget
      ? `${firebaseTarget}-${environment}`
      : `cognite-${project}-${environment}`;

    info(`target: ${target}`);
    setOutput('target', target);
  } catch (error) {
    if (error instanceof Error || typeof error === 'string') {
      setFailed(error);
    } else {
      setFailed('Unknown error occured.');
    }
  }
};

run();
