import fs from 'fs';
import * as https from 'https';

import chunk from 'lodash/chunk';

import { DIAGRAM_PARSER_OUTPUT_TYPE, DIAGRAM_PARSER_SOURCE } from '../src';

import { GRAPHS_DIR } from './constants';
import emptyDir from './utils/emptyDir';
import getClient from './utils/getClient';

const MAX_RETRIES = 3;

const downloadFileByUrl = (url: string, filePath: string, attempt = 0) => {
  return new Promise<void>((resolve, reject) => {
    if (attempt >= MAX_RETRIES) {
      reject(new Error(`Failed to download ${url}`));
      return;
    }

    const file = fs.createWriteStream(filePath, { encoding: 'binary' });
    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Status code: ${response.statusCode}`));
        return;
      }

      const retry = () => {
        file.close();
        console.log(`Retrying file download for ${filePath}...`);
        resolve(downloadFileByUrl(url, filePath, attempt + 1));
      };

      response.on('aborted', () => retry());

      response.on('timeout', () => retry());

      response.on('end', () => {
        console.log('Downloaded:', filePath);
        resolve();
      });

      response.pipe(file);
    });

    request.on('error', (error) => {
      reject(error);
    });
  });
};

const downloadFiles = async () => {
  await emptyDir(GRAPHS_DIR);

  const client = await getClient();
  const files = await client.files
    .list({
      filter: {
        mimeType: 'application/json',
        source: DIAGRAM_PARSER_SOURCE,
        metadata: {
          type: DIAGRAM_PARSER_OUTPUT_TYPE,
        },
      },
    })
    .autoPagingToArray({
      limit: Infinity,
    });

  console.log(`Downloading ${files.length} files...`);

  // eslint-disable-next-line no-restricted-syntax
  for (const chunkOfFiles of chunk(files, 10)) {
    // eslint-disable-next-line no-await-in-loop
    const links = await client.files.getDownloadUrls(
      chunkOfFiles
        .filter(({ externalId }) => externalId)
        .map(({ externalId }) => ({
          externalId,
        }))
    );

    // eslint-disable-next-line no-await-in-loop
    await Promise.all(
      links.map((link) =>
        downloadFileByUrl(
          link.downloadUrl,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          `${GRAPHS_DIR}/${link.externalId}`
        )
      )
    );
  }

  console.log(`Finished downloading to ${GRAPHS_DIR} folder`);
};

export default downloadFiles;
