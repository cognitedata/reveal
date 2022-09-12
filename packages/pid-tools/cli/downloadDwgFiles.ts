import fs from 'fs';
import * as https from 'https';

import chunk from 'lodash/chunk';

import getMsalClient, { MsalClientOptions } from '../src/utils/msalClient';
import { DIAGRAM_PARSER_SITE_KEY, DIAGRAM_PARSER_UNIT_KEY } from '../src';

import createDirIfNotExists from './utils/createDirIfNotExists';
import getDataDirPath from './utils/getDataDirPath';
import { SiteAndUnit } from './createSiteUnitEvents';

const MAX_RETRIES = 3;

export const downloadFileByUrl = (
  url: string,
  filePath: string,
  attempt = 0
) => {
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
        // eslint-disable-next-line no-console
        console.log(`Retrying file download for ${filePath}...`);
        resolve(downloadFileByUrl(url, filePath, attempt + 1));
      };

      response.on('aborted', () => retry());

      response.on('timeout', () => retry());

      response.on('end', () => {
        // eslint-disable-next-line no-console
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

const downloadDwgFiles = async (argv: any) => {
  const typedArgv = argv as SiteAndUnit & MsalClientOptions;

  const { site, unit } = typedArgv;
  const dir = getDataDirPath(site, unit);
  const client = await getMsalClient(typedArgv);
  const allFiles = await client.files
    .list({
      filter: {
        mimeType: 'application/octet-stream',
        metadata: {
          [DIAGRAM_PARSER_SITE_KEY]: site,
          [DIAGRAM_PARSER_UNIT_KEY]: unit,
        },
      },
    })
    .autoPagingToArray({
      limit: Infinity,
    });

  const files = allFiles.filter((file) => file.name.endsWith('.dwg'));

  // eslint-disable-next-line no-console
  console.log(`Downloading ${files.length} files...`);

  createDirIfNotExists(`${dir}`);

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
      links.map((link, i) =>
        downloadFileByUrl(
          link.downloadUrl,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          `${dir}/${chunkOfFiles[i].name}`
        )
      )
    );
  }

  // eslint-disable-next-line no-console
  console.log(`Finished downloading to ${dir} folder`);
};

export default downloadDwgFiles;
