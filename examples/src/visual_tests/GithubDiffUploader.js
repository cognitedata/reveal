const core = require('@actions/core');
const github = require('@actions/github')

async function commentOnPR(octokit) {
  const context = github.context;
  if (context.payload.pull_request == null) {
    console.log("Not running in a PR");
    return;
  }

  const url = "https://github.com/cognitedata/reveal/actions/runs/" + process.env["GITHUB_RUN_ID"];
  const message = "There were failures in the examples workflow. " +
    "This usually means a visual regression test has failed. " +
    `Image diffs for visual tests can be downloaded as an artifact [here](${url}). ` +
    "If there are no artifacts there's an error somewhere else in the examples workflow. " +
    "If you have made intentional changes you can update the image snapshots by running `yarn snapshots:update` in `examples/`";

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
