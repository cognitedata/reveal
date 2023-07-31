import fs from 'fs';

import { Storage } from '@google-cloud/storage';

const outputDest = process.argv[2];
const releasesFile = process.argv[3];
const configMap = process.argv[4];

const prepareReleaseArray = () => {
  const releases = fs.readFileSync(releasesFile).toString();

  const releaseLines = releases.trim().split('\n');

  const releaseArray = releaseLines
    .map((line) => {
      const splitLine = line.split(';');
      if (!splitLine || splitLine.length !== 3) {
        return null;
      }

      const release = {
        originalVersion: splitLine[0],
        finalVersion: splitLine[1],
        gcsPath: splitLine[2],
      };

      return release;
    })
    .filter((release) => release);

  return releaseArray;
};

const assignReleaseToConfigMap = (obj, release) => {
  if (obj.versionSpec === release.originalVersion) {
    obj.path = release.gcsPath;
    obj.finalVersion = release.finalVersion;
  }
  return obj;
};

const prepareConfigMap = (releaseArray) => {
  const jsonConfigMap = JSON.parse(fs.readFileSync(configMap).toString());

  releaseArray.forEach((release) => {
    jsonConfigMap.default = assignReleaseToConfigMap(
      jsonConfigMap.default,
      release
    );

    Object.keys(jsonConfigMap.projects).forEach((key) => {
      jsonConfigMap.projects[key] = assignReleaseToConfigMap(
        jsonConfigMap.projects[key],
        release
      );
    });

    Object.keys(jsonConfigMap.subDomains).forEach((key) => {
      jsonConfigMap.subDomains[key] = assignReleaseToConfigMap(
        jsonConfigMap.subDomains[key],
        release
      );
    });
  });

  return jsonConfigMap;
};

const downloadVersions = (releaseArray) => {
  const { GOOGLE_APPLICATION_CREDENTIALS } = process.env;

  if (!GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      'Cannot authenticate - please set GOOGLE_APPLICATION_CREDENTIALS environment variable'
    );
  }

  const storage = new Storage();

  const bucketName = 'frontend-app-server-cognitedata-production';

  const downloaded = [];

  return Promise.all(
    releaseArray.map(async (release) => {
      const gcsPath = release.gcsPath;
      if (
        release.gcsPath === 'fas-demo/local' ||
        downloaded.includes(gcsPath)
      ) {
        return;
      }
      downloaded.push(gcsPath);

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
  const releaseArray = prepareReleaseArray();

  const jsonConfigMap = prepareConfigMap(releaseArray);
  fs.writeFileSync(
    `${outputDest}/configMap.json`,
    JSON.stringify(jsonConfigMap)
  );

  await downloadVersions(releaseArray);
};

await main();

console.log('output files:', fs.readdirSync(outputDest));
