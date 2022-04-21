import fsPromises from 'fs/promises';

import uniq from 'lodash/uniq';

import {
  DIAGRAM_PARSER_PARSED_DOCUMENT_EXTERNAL_ID,
  DIAGRAM_PARSER_PDF_EXTERNAL_ID,
  DIAGRAM_PARSER_SOURCE,
  DIAGRAM_PARSER_TYPE,
  DOCUMENTS_DIR,
  LINE_LABEL_PREFIX,
} from './constants';
import getClient from './utils/getClient';

const readJsonFromFile = async (filePath: string): Promise<any> => {
  const fileContent = await fsPromises.readFile(filePath, 'utf8');
  return JSON.parse(fileContent);
};

const lineNumberLabelExternalId = (lineNumber: string): string =>
  `${LINE_LABEL_PREFIX}${lineNumber}`;

const updateFileMetadata = async () => {
  const client = await getClient();
  const fileNames = await fsPromises.readdir(DOCUMENTS_DIR);
  const filteredFileNames = fileNames.filter((fileName) =>
    fileName.endsWith('.json')
  );

  // eslint-disable-next-line no-restricted-syntax
  for (const fileName of filteredFileNames) {
    // eslint-disable-next-line no-await-in-loop
    const document = await readJsonFromFile(`${DOCUMENTS_DIR}/${fileName}`);

    if (
      document.annotations === undefined ||
      document.annotations.length === 0
    ) {
      console.log('No annotations found in document, skipping: ', fileName);
      // eslint-disable-next-line no-continue
      continue;
    }

    if (document.pdfExternalId === undefined) {
      console.log('No pdfExternalId found in document, skipping: ', fileName);
      // eslint-disable-next-line no-continue
      continue;
    }

    if (document.externalId === undefined) {
      console.log('No externalId found in document, skipping: ', fileName);
      // eslint-disable-next-line no-continue
      continue;
    }

    if (
      !Array.isArray(document.lineNumbers) ||
      document.lineNumbers.length === 0
    ) {
      console.log('No line numbers found in document, skipping: ', fileName);
      // eslint-disable-next-line no-continue
      continue;
    }

    const lineNumbers: string[] = uniq(document.lineNumbers);

    if (document.type === undefined) {
      console.log('No type found in document, skipping: ', fileName);
      // eslint-disable-next-line no-continue
      continue;
    }

    const lineNumbersMetadata: Record<string, string> = lineNumbers.reduce(
      (acc, lineNumber) => {
        acc[lineNumberLabelExternalId(lineNumber)] = 'true';
        return acc;
      },
      {}
    );

    const update = {
      metadata: {
        set: {
          [DIAGRAM_PARSER_SOURCE]: 'true',
          [DIAGRAM_PARSER_TYPE]: document.type,
          [DIAGRAM_PARSER_PDF_EXTERNAL_ID]: document.pdfExternalId,
          [DIAGRAM_PARSER_PARSED_DOCUMENT_EXTERNAL_ID]: document.externalId,
          ...lineNumbersMetadata,
        },
      },
    };

    // eslint-disable-next-line no-await-in-loop
    await client.files.update([
      {
        externalId: document.externalId,
        update,
      },
      {
        externalId: document.pdfExternalId,
        update,
      },
    ]);

    console.log(
      `Updated files: ${document.externalId}, ${document.pdfExternalId} with lineNumbers: ${lineNumbers}`
    );
  }
};

export default updateFileMetadata;
