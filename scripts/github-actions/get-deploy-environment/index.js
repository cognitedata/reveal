const { execSync } = require('child_process');

const { setFailed, setOutput, getInput, info } = require('@actions/core');

const run = async () => {
  try {
    const project = getInput('project');
    const branch = getInput('branch');

    const projectConfigRaw = execSync(
      `npx nx show project ${project}`
    ).toString('utf-8');
    const projectConfig = JSON.parse(projectConfigRaw);

    const isPreviewBranch = branch.startsWith('release-preview-');
    const isReleaseBranch = !isPreviewBranch && branch.startsWith('release-');
    const isUsingSingleBranchStrategy =
      projectConfig?.pipeline?.releaseStrategy === 'single-branch';

    const releaseToProd = isUsingSingleBranchStrategy || isReleaseBranch;

    if (releaseToProd) {
      if (project === 'platypus') {
        setOutput('build', 'fusion');
      } else {
        setOutput('build', 'production');
      }
      setOutput('environment', 'production');
    } else if (isPreviewBranch) {
      setOutput('build', 'preview');
      setOutput('environment', 'preview');
    } else {
      setOutput('build', 'staging');
      setOutput('environment', 'staging');
    }
  } catch (error) {
    if (error instanceof Error || typeof error === 'string') {
      setFailed(error);
    } else {
      setFailed('Unknown error occured.');
    }
  }
};

run();
