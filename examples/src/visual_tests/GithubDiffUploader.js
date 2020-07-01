const core = require('@actions/core');
const github = require('@actions/github')

async function commentOnPR(octokit) {
  const context = github.context;
  if (context.payload.pull_request == null) {
    console.log("Not running in a PR");
    return;
  }

  const url = "https://github.com/cognitedata/reveal/actions/runs/" + process.env["GITHUB_RUN_ID"];
  const message = "There were failures during the visual regression test stage. " +
    `Any image diffs for visual tests can be downloaded as an artifact [here](${url}). ` +
    "If the changes are intentional you can update the snapshots by running `yarn snapshots:update`";

  const prNumber = context.payload.pull_request.number;
  await octokit.issues.createComment({
    ...context.repo,
    issue_number: prNumber,
    body: message
  });
}

async function run() {
  const commitHash = process.env["GITHUB_SHA"];
  if (!commitHash) {
    console.log("Not running in Github - exiting");
    process.exit();
  }
  try {
    const github_token = process.env['ACTIONS_RUNTIME_TOKEN'];
    const octokit = github.getOctokit(github_token);
    await commentOnPR(octokit);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
