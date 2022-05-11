import fs from 'fs';

import chunk from 'lodash/chunk';
import { CogniteClient, FileInfo } from '@cognite/sdk';

import getClient from '../src/utils/getClient';

import createdirIfNotExists from './utils/createDirIfNotExists';

const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

// eslint-disable-next-line no-constant-condition
const getJobStatus = async (
  client: CogniteClient,
  jobId: string
): Promise<string> => {
  // eslint-disable-next-line no-await-in-loop
  const responseJobStatus = await client.get(
    `/api/playground/projects/${client.project}/context/cadConversion/convert/${jobId}`
  );

  if (responseJobStatus.data.status === 'Running') {
    await sleep(200);
    return getJobStatus(client, jobId);
  }
  return responseJobStatus.data.status as unknown as string;
};

const convertChunk = async (
  dwgFiles: FileInfo[],
  client: CogniteClient,
  saveDir: string
) => {
  // Start job
  const responseJobStart = await client.post(
    `/api/playground/projects/${client.project}/context/cadConversion/convert`,
    {
      data: {
        items: dwgFiles.map((dwgFile) => {
          return { fileId: dwgFile.id };
        }),
      },
    }
  );

  const { jobId } = responseJobStart.data;

  // eslint-disable-next-line no-console
  console.log(`Converting ${dwgFiles.length} DWGs with job id ${jobId}`);

  const jobStatus = await getJobStatus(client, jobId);
  if (jobStatus !== 'Completed') {
    // eslint-disable-next-line no-console
    console.log(
      'Unable to convert files with ids: ',
      dwgFiles.map((f) => f.id)
    );
    return;
  }

  const pendingResults = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const dwgFile of dwgFiles) {
    pendingResults.push(
      client.get(
        `/api/playground/projects/${client.project}/context/cadConversion/convert/${jobId}/download?fileId=${dwgFile.id}`,
        { responseType: 'arraybuffer' }
      )
    );
  }

  const results = await Promise.all(pendingResults);
  results.forEach((result, i) => {
    const path = `${saveDir}/${dwgFiles[i].name.replace('.dwg', '.pdf')}`;
    fs.writeFileSync(path, Buffer.from(result.data), 'binary');
  });
};

export const convertDwgToPdf = async (argv) => {
  const { unit, dir } = argv as unknown as {
    unit: string;
    dir: string;
  };

  const client = await getClient();
  const allFiles = await client.files
    .list({
      filter: {
        mimeType: 'application/octet-stream',
      },
    })
    .autoPagingToArray({
      limit: Infinity,
    });

  const files = allFiles.filter(
    (file) => file.name.includes(unit) && file.name.endsWith('.dwg')
  );

  // eslint-disable-next-line no-console
  console.log(`Will convert ${files.length} DWGs...`);

  createdirIfNotExists(dir);

  // eslint-disable-next-line no-restricted-syntax
  for (const chunkOfFiles of chunk(files, 20)) {
    // eslint-disable-next-line no-await-in-loop
    await convertChunk(chunkOfFiles, client, dir);
  }
};

export default convertDwgToPdf;
