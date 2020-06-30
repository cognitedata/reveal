const core = require('@actions/core');
const glob = require('@actions/glob');
const artifact = require('@actions/artifact');
const fs = require('fs');

// TODO this should be converted to an actual reporter in TS registered with jest when
//      https://github.com/facebook/jest/issues/8810 is resolved

async function findFiles(path) {
  const globber = await glob.create(path)
  const rawSearchResults = await globber.glob()

  // Remove directories
  const searchResults = []
  for (const searchResult of rawSearchResults) {
    if (!fs.lstatSync(searchResult).isDirectory()) {
      searchResults.push(searchResult)
    }
  }

  return searchResults;
}

async function run() {
  const commitHash = process.env["GITHUB_SHA"];
  if (!commitHash) {
    console.log("Not running in Github - exiting");
    process.exit();
  }
  try {
    const files = await findFiles("src/visual_tests/__image_snapshots__/__diff_output__/*");
    const numberOfFiles = files.length;
    console.log(numberOfFiles + " file(s) found");
    if (numberOfFiles == 0) {
      console.log("Ran GithubDiffUploader.js but no diff files were found. Did you mean to run this file?");
      process.exit();
    }

    const artifactName = "image-diffs-" + commitHash;
    const client = artifact.create();

    const uploadResponse = await client.uploadArtifact(artifactName, files, ".", { continueOnError: false });

    if (uploadResponse.failedItems.length > 0) {
      core.setFailed(uploadResponse.failedItems.length + ' images failed to upload.');
    }
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
