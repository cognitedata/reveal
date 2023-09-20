const { execSync } = require('child_process');

const { setFailed, setOutput, getInput, info } = require('@actions/core');

const run = async () => {
  try {
    const base = getInput('base');
    const head = getInput('head');
    const target = getInput('target');
    const projects = getInput('projects');
    const exclude = getInput('exclude');
    const isRelease = getInput('isRelease');
    const branchName = getInput('branchName');

    if (isRelease === 'true' && branchName.startsWith('release-')) {
      const project = branchName
        .replace('release-preview-', '')
        .replace('release-', '');

      setOutput('projects', [project]);
      setOutput('projectsString', project);
      setOutput(project, true);

      return;
    }

    const affectedProjects = execSync(
      `npx nx show projects --affected --json --withTarget=${target} --base=${base} --head=${head} --projects ${projects} --exclude ${exclude}`
    ).toString('utf-8');

    const parsedOutput = JSON.parse(affectedProjects);
    const stringOutput = parsedOutput.join(', ');
    info(`Output from NX: ${affectedProjects}`);

    setOutput('projects', parsedOutput);
    setOutput('projectsString', stringOutput);

    info(`projects: ${parsedOutput}`);
    info(`projectsString: ${stringOutput}`);

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
