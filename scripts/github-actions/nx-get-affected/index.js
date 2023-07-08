const { execSync } = require('child_process');

const { debug, setFailed, setOutput, getInput } = require('@actions/core');

const run = async () => {
  try {
    const base = getInput('base') || 'origin/master';
    const head = getInput('head') || 'HEAD';
    const target = getInput('target') || 'build';
    const type = getInput('type');

    const projects = execSync(
      `npx nx show projects --affected  --json --withTarget=${target} --base=${base} --head=${head} ${
        type ? `--projects ${type}/*` : ''
      }`
      // `npx nx show projects --affected --json --withTarget=build`
    ).toString('utf-8');

    debug(`Output from NX: ${projects}`);
    //
    const parsedOutput = JSON.parse(projects);
    setOutput('list', parsedOutput);
    setOutput('samir', 'works');

    parsedOutput.forEach((project) => {
      setOutput(project, true);
    });
  } catch (error) {
    if (error instanceof Error || typeof error === 'string') {
      setFailed(error);
    } else {
      setFailed('Unknown error occured.');
    }
  }
};

run();
