/* eslint-disable no-console */
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const program = require('commander');
const fs = require('fs-extra');
const shell = require('child_process').execSync;

const tempFolderPath = path.join(__dirname, './temp');

program
  .version('0.0.1')
  .option(
    '-b --bucket [cdf-hub-dev|cdf-hub-staging|cdf-hub-production]',
    'Bucket name'
  )
  .option('-p --packageName <string>', 'Package name')
  .option('-o --outputFilename <string>', 'Output filename')
  .option('-d --destinationPath <string>', 'Destination path for the files')
  .parse(process.argv);

if (!program.bucket) {
  console.error('Missing bucket');
  program.help();
}

if (!program.packageName) {
  console.error('Missing packageName');
  program.help();
}

if (!program.outputFilename) {
  console.error('Missing outputFilename');
  program.help();
}

if (!program.destinationPath) {
  console.error('Missing destinationPath');
  program.help();
}

const downloadFile = async ({ srcFilename, storage, bucket }) => {
  const destFilename = path.join(tempFolderPath, srcFilename);
  const options = {
    // The path to which the file should be downloaded, e.g. "./file.txt"
    destination: destFilename,
  };
  try {
    await storage.bucket(bucket).file(srcFilename).download(options);

    console.log(`gs://${bucket}/${srcFilename} downloaded to ${destFilename}.`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

function getCSP(str) {
  const indexStart = str.indexOf('<meta http-equiv="Content-Security-Policy"');
  const indexEnd =
    indexStart + str.substring(indexStart, str.length - 1).indexOf('>') + 1;
  return str.substring(indexStart, indexEnd);
}

/**
 * Add storage.googleapis.com to the whitelist of domains allowed to
 * load code.
 */
function updateCSP(filename) {
  let html = fs.readFileSync(path.join(tempFolderPath, filename)).toString();
  const csp = getCSP(html);
  const modifiedCsp = csp.replace(
    "script-src 'self'",
    "script-src 'self' https://storage.googleapis.com"
  );

  html = html.replace(csp, modifiedCsp);
  fs.writeFileSync(path.join(tempFolderPath, filename), html);
}

async function main() {
  const storage = new Storage();

  const IMPORTMAP_FILENAME = 'import-map.json';
  const INDEX_HTML_FILENAME = 'index.html';
  const INDEX_JS_FILENAME = 'root.js';

  const { bucket, packageName, outputFilename, destinationPath } = program;

  const importMapDestPath = path.join(tempFolderPath, IMPORTMAP_FILENAME);

  try {
    if (!fs.existsSync(tempFolderPath)) {
      fs.mkdirSync(tempFolderPath);
    }
    await downloadFile({ srcFilename: IMPORTMAP_FILENAME, storage, bucket });
    await downloadFile({ srcFilename: INDEX_HTML_FILENAME, storage, bucket });
    await downloadFile({ srcFilename: INDEX_JS_FILENAME, storage, bucket });

    updateCSP(INDEX_HTML_FILENAME);

    // Read the import map into memory
    const obj = JSON.parse(
      fs.readFileSync(path.join(tempFolderPath, IMPORTMAP_FILENAME), 'utf8')
    );

    // override the packageName to the PR build bundle url
    obj.imports[packageName] = `/static/${outputFilename}`;

    // write file back to the system
    fs.writeFileSync(importMapDestPath, JSON.stringify(obj));

    // copy the files to the destination folder

    const buildDir = path.join(__dirname, '..', destinationPath);

    // Copy the js resources to `/static` because of an issue with
    // serving assets in the preview server.
    shell(`mkdir ${buildDir}/static/static`);
    shell(`mv ${buildDir}/static/js ${buildDir}/static/static`);
    shell(`mv ${buildDir}/static/media ${buildDir}/static/static`);
    shell(`mv ${buildDir}/index.js ${buildDir}/static`);
    shell(`mv ${buildDir}/index.js.map ${buildDir}/static`);

    // Copy in files from fusion.cognite.com
    shell(`mv ${tempFolderPath}/* ${buildDir}/`);

    console.log('PR files now ready to be uploaded');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
