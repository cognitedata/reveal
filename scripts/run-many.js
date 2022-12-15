const execSync = require('child_process').execSync;

const target = process.argv[2];
const jobIndex = Number(process.argv[3]);
const jobCount = Number(process.argv[4]);
const baseSha = process.argv[5];
const headSha = process.argv[6];

const affected = execSync(
  `npx nx print-affected --base=${baseSha} --head=${headSha} --target=${target}`
).toString('utf-8');
const array = JSON.parse(affected)
  .tasks.map((t) => t.target.project)
  .slice()
  .sort();
const sliceSize = Math.max(Math.floor(array.length / jobCount), 1);
const projects =
  jobIndex < jobCount
    ? array.slice(sliceSize * (jobIndex - 1), sliceSize * jobIndex)
    : array.slice(sliceSize * (jobIndex - 1));

if (projects.length > 0) {
  execSync(
    `npx nx run-many --configuration=production --target=${target} --projects=${projects} --parallel`,
    {
      stdio: [0, 1, 2],
    }
  );
}
