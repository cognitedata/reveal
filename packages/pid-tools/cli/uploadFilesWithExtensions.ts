import path from 'path';
import fsPromises from 'fs/promises';

import {
  DIAGRAM_PARSER_SITE_KEY,
  DIAGRAM_PARSER_SOURCE,
  DIAGRAM_PARSER_UNIT_KEY,
} from '../src';
import getMsalClient, { MsalClientOptions } from '../src/utils/msalClient';

import getDataDirPath from './utils/getDataDirPath';

const mimeTypeByFileExtension = {
  '.json': 'application/json',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.dwg': 'application/octet-stream',
};

const getFileExtensionByFileName = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return '';
  }
  return fileName.substring(lastDotIndex);
};

const uploadFilesWithExtensions = async (
  argv: any,
  fileExtensionsToUpload: string[]
) => {
  const { site, unit } = argv as {
    site: string;
    unit: string;
  };
  const dir = getDataDirPath(site, unit);
  const client = await getMsalClient(argv as MsalClientOptions);

  const fileNames = await fsPromises.readdir(dir);
  const supportedFileNames = fileNames.filter((fileName) => {
    const fileExtension = getFileExtensionByFileName(fileName);
    if (fileExtension === '') {
      return false;
    }

    return fileExtensionsToUpload.includes(fileExtension);
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const [i, fileName] of supportedFileNames.entries()) {
    // eslint-disable-next-line no-await-in-loop
    const fileBuffer = await fsPromises.readFile(path.resolve(dir, fileName));
    // eslint-disable-next-line no-await-in-loop
    await client.files.upload(
      {
        name: fileName,
        mimeType: mimeTypeByFileExtension[getFileExtensionByFileName(fileName)],
        externalId: fileName,
        metadata: {
          [DIAGRAM_PARSER_SOURCE]: 'true',
          [DIAGRAM_PARSER_SITE_KEY]: site,
          [DIAGRAM_PARSER_UNIT_KEY]: unit,
        },
        source: DIAGRAM_PARSER_SOURCE,
      },
      fileBuffer,
      true
    );
    // eslint-disable-next-line no-console
    console.log(
      `${i + 1} / ${supportedFileNames.length}: Uploaded ${fileName}`
    );
  }
};

export default uploadFilesWithExtensions;
