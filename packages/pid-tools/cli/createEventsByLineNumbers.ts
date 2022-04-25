import fsPromises from 'fs/promises';

import {
  getLineReviewEventExternalId,
  LINE_REVIEW_EVENT_TYPE,
  LINEWALK_VERSION_KEY,
} from '../src';

import { DOCUMENTS_DIR } from './constants';
import getClient from './utils/getClient';

const readJsonFromFile = async (filePath: string): Promise<any> => {
  const fileContent = await fsPromises.readFile(filePath, 'utf8');
  return JSON.parse(fileContent);
};

const processedLineNumbers = new Set<number>();

const createEventsByLineNumbers = async ({
  outputVersion,
}: {
  outputVersion: string;
}) => {
  const client = await getClient();
  const fileNames = await fsPromises.readdir(DOCUMENTS_DIR);
  const filteredFileNames = fileNames.filter((fileName) =>
    fileName.endsWith('.json')
  );

  // eslint-disable-next-line no-restricted-syntax
  for (const fileName of filteredFileNames) {
    // eslint-disable-next-line no-await-in-loop
    const document = await readJsonFromFile(`${DOCUMENTS_DIR}/${fileName}`);

    if (document.type !== 'iso') {
      // eslint-disable-next-line no-continue
      continue;
    }

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

    // eslint-disable-next-line no-restricted-syntax
    for (const lineNumber of document.lineNumbers) {
      if (processedLineNumbers.has(lineNumber)) {
        // eslint-disable-next-line no-continue
        continue;
      }
      processedLineNumbers.add(lineNumber);

      // Delete existing
      try {
        // eslint-disable-next-line no-await-in-loop
        await client.events.delete([
          {
            externalId: getLineReviewEventExternalId(outputVersion, lineNumber),
          },
        ]);
      } catch (error) {
        // Silent
      }

      // Create new
      // eslint-disable-next-line no-await-in-loop
      await client.events.create([
        {
          externalId: getLineReviewEventExternalId(outputVersion, lineNumber),
          type: LINE_REVIEW_EVENT_TYPE,
          metadata: {
            [LINEWALK_VERSION_KEY]: outputVersion,
            lineNumber,
            assignee: 'Garima',
            status: 'OPEN',
            system: 'unknown',
            comment: '',
            state: JSON.stringify({
              discrepancies: [],
              textAnnotations: [],
            }),
          },
        },
      ]);

      console.log('Created event for', lineNumber);
    }
  }
};

export default createEventsByLineNumbers;
