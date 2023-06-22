const { execSync } = require('child_process');

const { debug, setFailed, setOutput } = require('@actions/core');

const run = async () => {

  try {
    const json = await execSync(
      `npx nx print-affected --base=origin/master --head=HEAD`,
      {
        encoding: 'utf-8',
      }
    );

    // eslint-disable-next-line testing-library/no-debugging-utils
    debug(`Output from NX: ${json}`);

    const parsedOutput = JSON.parse(json);

    parsedOutput.projects.forEach((package) => {
      setOutput(package, true);
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
