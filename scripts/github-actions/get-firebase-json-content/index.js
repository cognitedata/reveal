const { setFailed, setOutput, getInput, info } = require('@actions/core');
const { readFileSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');

const run = async () => {
  try {
    const site = getInput('firebaseSite');
    const project = getInput('project');
    info(`site: ${site}`);
    const projectFolderPath = resolve(__dirname, '../../../apps', project);
    const projectFirebaseJsonFile = projectFolderPath + '/firebase.json';

    const firebaseJsonFilePath = existsSync(projectFirebaseJsonFile)
      ? projectFirebaseJsonFile
      : resolve(__dirname, './firebase.json');

    let firebaseJsonContent = JSON.parse(
      readFileSync(firebaseJsonFilePath, 'utf-8')
    );

    firebaseJsonContent.hosting.site = site;
    firebaseJsonContent.hosting.public = '.';
    firebaseJsonContent = JSON.stringify(
      { hosting: [firebaseJsonContent.hosting] },
      null,
      2
    );

    info(`content: ${firebaseJsonContent}`);
    setOutput('content', firebaseJsonContent);
  } catch (error) {
    if (error instanceof Error || typeof error === 'string') {
      setFailed(error);
    } else {
      setFailed('Unknown error occured.');
    }
  }
};

run();
