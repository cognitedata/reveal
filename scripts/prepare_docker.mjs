import fs from 'fs';

import { Storage } from '@google-cloud/storage';

const outputDest = process.argv[2];
const releasesFile = process.argv[3];
const configMap = process.argv[4];

const prepareConfigMap = (releases) => {
  const jsonConfigMap = JSON.parse(fs.readFileSync(configMap).toString());
  const releaseLines = releases.trim().split('\n');

  releaseLines.forEach((line) => {
    if (line === '---- Releases ----') return;
    const splitLine = line.split(';');
    const originalVersion = splitLine[0];
    const finalVersion = splitLine[1];
    const gcsPath = splitLine[2];

    if (jsonConfigMap.apps.versionSpec === originalVersion) {
      jsonConfigMap.apps.path = gcsPath;
      jsonConfigMap.apps.finalVersion = finalVersion;
    }

    Object.keys(jsonConfigMap.projects).forEach((key) => {
      if (jsonConfigMap.projects[key].versionSpec === originalVersion) {
        jsonConfigMap.projects[key].path = gcsPath;
        jsonConfigMap.projects[key].finalVersion = finalVersion;
      }
    });
  });

  return jsonConfigMap;
};

const downloadVersions = (releases) => {
  const { GOOGLE_APPLICATION_CREDENTIALS } = process.env;

  if (!GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      'Cannot authenticate - please set GOOGLE_APPLICATION_CREDENTIALS environment variable'
    );
  }

  const storage = new Storage();

  const bucketName = 'frontend-app-server-cognitedata-production';

  const releaseLines = releases.trim().split('\n');
  return Promise.all(
    releaseLines.map(async (line) => {
      if (line === '---- Releases ----') return;
      const gcsPath = line.split(';')[2];

      const options = {
        prefix: gcsPath,
        autoPaginate: false,
      };

      const [files] = await storage.bucket(bucketName).getFiles(options);
      const folderPath = gcsPath.split('/').slice(1).join('/');
      if (!fs.existsSync(`${outputDest}/${folderPath}`)) {
        fs.mkdirSync(`${outputDest}/${folderPath}`);
      }
      return Promise.all(
        files.map((file) => {
          const fileName = file.name.replace(`${gcsPath}/`, '');
          const folderName = fileName.split('/').slice(0, -1).join('/');

          if (!fs.existsSync(`${outputDest}/${folderPath}/${folderName}`)) {
            fs.mkdirSync(`${outputDest}/${folderPath}/${folderName}`, {
              recursive: true,
            });
          }

          const downloadOption = {
            destination: `${outputDest}/${folderPath}/${fileName}`,
          };
          return file.download(downloadOption);
        })
      );
    })
  );
};

const main = async () => {
  const releases = fs.readFileSync(releasesFile).toString();
  const jsonConfigMap = prepareConfigMap(releases);
  fs.writeFileSync(
    `${outputDest}/configMap.json`,
    JSON.stringify(jsonConfigMap)
  );

  await downloadVersions(releases);
};

await main();

console.log('output files:', fs.readdirSync(outputDest));
