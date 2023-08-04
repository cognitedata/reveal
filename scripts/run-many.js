const execSync = require('child_process').execSync;

const runCmd = (cmd) => {
  execSync(cmd, {
    stdio: [0, 1, 2],
  });
};

const target = process.argv[2];
const jobIndex = Number(process.argv[3]);
const jobCount = Number(process.argv[4]);
const baseSha = process.argv[5];
const headSha = process.argv[6];
const codecovToken = process.argv[7];
const baseBranch = process.argv[8] || '';

const parseNxTargetString = (input) => {
  return JSON.parse(input)
    .tasks.map((t) => ({ project: t.target.project, outputs: t.outputs }))
    .slice()
    .sort();
};

const isReleaseBranch = (branchName) => {
  return branchName.startsWith('release-');
};

const getReleaseProject = (branchName) => {
  // strip off the prefix
  return branchName.replace('release-preview-', '').replace('release-', '');
};

const affectedProjects = parseNxTargetString(
  execSync(
    `npx nx print-affected --target=${target} --base=${baseSha} --head=${headSha} --exclude=interactive-diagrams,charts`
  ).toString('utf-8')
).filter(({ project }) => {
  return isReleaseBranch(baseBranch)
    ? project === getReleaseProject(baseBranch)
    : true;
});

const main = () => {
  const sliceSize = Math.max(Math.floor(affectedProjects.length / jobCount), 1);

  const projects =
    jobIndex < jobCount
      ? affectedProjects.slice(sliceSize * (jobIndex - 1), sliceSize * jobIndex)
      : affectedProjects.slice(sliceSize * (jobIndex - 1));

  if (projects.length > 0) {
    const projectNames = projects.map(({ project }) => project);

    if (target === 'test') {
      runCmd(`yarn test ${projectNames}`);

      // projects.forEach(({ project, outputs }) => {
      //   const basePath = outputs[0];
      //   const files = `${basePath}/coverage-final.json,${basePath}/cobertura-coverage.xml`;
      //
      //   console.log(`Uploading codecov for ${project} (path: ${basePath})`);
      //
      //   // Upload codecov with specific flags, see: https://docs.codecov.com/docs/flags
      //   runCmd(
      //     `./bin/codecov-linux -F ${project} -f ${files} -t ${codecovToken}`
      //   );
      // });
    } else if (target === 'e2e') {
      runCmd(
        `yarn nx run-many --configuration=production --target=${target} --projects=${projectNames} --verbose=true --parallel --exclude="platypus*" --exclude="cdf-nx-plugin-e2e"  --env.DATA_EXPLORER_CLIENT_ID=${process.env.DATA_EXPLORER_CLIENT_ID} --env.DATA_EXPLORER_CLIENT_SECRET=${process.env.DATA_EXPLORER_CLIENT_SECRET}`
      );
    } else {
      runCmd(
        `npx nx run-many --configuration=production --target=${target} --projects=${projectNames} --verbose=true --parallel=${
          target === 'build' ? 2 : 5
        } --exclude=interactive-diagrams,charts`
      );
    }
  }
};

main();
