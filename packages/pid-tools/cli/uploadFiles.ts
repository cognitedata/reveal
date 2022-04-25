import fs from 'fs';
import path from 'path';
import util from 'util';
import fsPromises from 'fs/promises';

import { DIAGRAM_PARSER_SOURCE, LINEWALK_VERSION_KEY } from '../src';

import { DOCUMENTS_DIR } from './constants';
import getClient from './utils/getClient';

const readDir = util.promisify(fs.readdir);

const mimeTypeByFileExtension = {
  '.json': 'application/json',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
};

const getFileExtensionByFileName = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return '';
  }
  return fileName.substring(lastDotIndex);
};

const uploadFiles = async ({ outputVersion }: { outputVersion: string }) => {
  const supportedFileExtensions = Object.keys(mimeTypeByFileExtension);
  const fileNames = await readDir(DOCUMENTS_DIR);
  const supportedFileNames = fileNames.filter((fileName) => {
    const fileExtension = getFileExtensionByFileName(fileName);
    if (fileExtension === '') {
      return false;
    }

    return supportedFileExtensions.includes(fileExtension);
  });

  const client = await getClient();

  // eslint-disable-next-line no-restricted-syntax
  for (const fileName of supportedFileNames) {
    // eslint-disable-next-line no-await-in-loop
    const fileBuffer = await fsPromises.readFile(
      path.resolve(DOCUMENTS_DIR, fileName)
    );
    // eslint-disable-next-line no-await-in-loop
    await client.files.upload(
      {
        name: fileName,
        mimeType: mimeTypeByFileExtension[getFileExtensionByFileName(fileName)],
        externalId: fileName,
        source: DIAGRAM_PARSER_SOURCE,
        metadata: {
          [LINEWALK_VERSION_KEY]: outputVersion,
        },
      },
      fileBuffer,
      true
    );
    console.log(`Uploaded ${fileName}`);
  }
};

export default uploadFiles;
