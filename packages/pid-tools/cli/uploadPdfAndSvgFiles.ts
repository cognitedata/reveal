import fs from 'fs';
import path from 'path';
import util from 'util';
import fsPromises from 'fs/promises';

import { DIAGRAM_PARSER_SOURCE } from '../src';
import getClient from '../src/utils/getClient';

export const readDir = util.promisify(fs.readdir);

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

const uploadPdfAndSvgFiles = async (argv) => {
  const { dir } = argv as unknown as {
    dir: string;
  };
  const fileExtensionsToUpload = ['.svg', '.pdf'];

  const fileNames = await readDir(dir);
  const supportedFileNames = fileNames.filter((fileName) => {
    const fileExtension = getFileExtensionByFileName(fileName);
    if (fileExtension === '') {
      return false;
    }

    return fileExtensionsToUpload.includes(fileExtension);
  });

  const client = await getClient();

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

export default uploadPdfAndSvgFiles;
