import {
  DIAGRAM_PARSER_PARSED_DOCUMENT_EXTERNAL_ID,
  DIAGRAM_PARSER_TYPE,
} from '@cognite/pid-tools';
import type { CogniteClient, FileInfo } from '@cognite/sdk';
import zipWith from 'lodash/zipWith';
import * as PDFJS from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist/types/display/api';
import sortBy from 'lodash/sortBy';

import isNotUndefined from '../../utils/isNotUndefined';

import {
  LineReview,
  LineReviewState,
  WorkspaceDocument,
  DocumentType,
} from './types';

PDFJS.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js`;
export const LINE_LABEL_PREFIX = 'LINE_LABEL_';

export const getDocumentUrlByExternalId =
  (client: CogniteClient) =>
  async (externalId: string): Promise<string> => {
    try {
      const response = await client.files.getDownloadUrls([{ externalId }]);
      return response[0].downloadUrl;
    } catch (error) {
      throw new Error('Getting document url failed');
    }
  };

const getJsonByExternalId = async <T = unknown>(
  client: CogniteClient,
  externalId: string
): Promise<T> => {
  const url = await getDocumentUrlByExternalId(client)(externalId);
  const response = await fetch(url);
  const json = await response.json();
  return json;
};

export const getJsonsByExternalIds = async <T = unknown>(
  client: CogniteClient,
  externalIds: string[]
): Promise<T[]> => {
  const downloadUrls = await client.files.getDownloadUrls(
    externalIds.map((externalId) => ({ externalId }))
  );
  const responses = await Promise.all(
    downloadUrls.map(({ downloadUrl }) => fetch(downloadUrl))
  );
  return Promise.all(responses.map((response) => response.json()));
};

export const getPdfsByExternalIds = async (
  client: CogniteClient,
  externalIds: string[]
): Promise<PDFDocumentProxy[]> => {
  const downloadUrls = await client.files.getDownloadUrls(
    externalIds.map((externalId) => ({ externalId }))
  );

  return Promise.all(
    downloadUrls.map(
      ({ downloadUrl }) => PDFJS.getDocument(downloadUrl).promise
    )
  );
};

const saveJsonByExternalId = async <T = unknown>(
  client: CogniteClient,
  externalId: string,
  data: T
): Promise<void> => {
  try {
    await client.files.upload(
      { externalId, name: externalId, mimeType: 'application/json' },
      JSON.stringify(data),
      true
    );
  } catch (error) {
    console.log('Throws errors unnecessarily');
  }
};

const VERSION = '0.0.10';
const LINE_REVIEWS_ENTRY_POINT = `LINE_REVIEWS_V${VERSION}.json`;
export const getLineReviews = async (client: CogniteClient) => {
  const lineReviewsEntryPointResponse = await getJsonByExternalId<{
    lineReviews: LineReview[];
  }>(client, LINE_REVIEWS_ENTRY_POINT);

  return lineReviewsEntryPointResponse.lineReviews;
};

export const saveLineReviews = async (
  client: CogniteClient,
  lineReviews: LineReview[]
) => {
  return saveJsonByExternalId(client, LINE_REVIEWS_ENTRY_POINT, {
    externalId: LINE_REVIEWS_ENTRY_POINT,
    lineReviews,
  });
};

export const addDocumentLabel = async (
  client: CogniteClient,
  externalId: string,
  lineNumber: string
) => {
  await client.files.update([
    {
      externalId,
      update: {
        metadata: {
          add: {
            [`${LINE_LABEL_PREFIX}${lineNumber}`]: 'true',
          },
          remove: [],
        },
      },
    },
  ]);
};

export const removeDocumentLabel = async (
  client: CogniteClient,
  externalId: string,
  lineNumber: string
) => {
  await client.files.update([
    {
      externalId,
      update: {
        metadata: {
          add: {},
          remove: [`${LINE_LABEL_PREFIX}${lineNumber}`],
        },
      },
    },
  ]);
};

export const getWorkspaceDocuments = async (
  client: CogniteClient,
  files: FileInfo[]
) => {
  const pdfDocuments = await getPdfsByExternalIds(
    client,
    files.map(({ externalId }) => externalId).filter(isNotUndefined)
  );

  const workspaceDocuments: WorkspaceDocument[] = zipWith<
    FileInfo,
    PDFDocumentProxy,
    WorkspaceDocument
  >(files, pdfDocuments, (file, pdf) => {
    const externalId =
      file.metadata?.[DIAGRAM_PARSER_PARSED_DOCUMENT_EXTERNAL_ID];
    const type = file.metadata?.[DIAGRAM_PARSER_TYPE] as
      | DocumentType
      | undefined;
    const pdfExternalId = file.externalId;

    if (externalId === undefined) {
      throw new Error('Missing external id');
    }

    if (type === undefined) {
      throw new Error('Missing type');
    }

    if (pdfExternalId === undefined) {
      throw new Error('Missing pdf external id');
    }

    return {
      externalId,
      pdfExternalId,
      pdf,
      type,
    };
  });

  return workspaceDocuments;
};

export const getLineReviewDocuments = async (
  client: CogniteClient,
  lineNumber: string
) => {
  const files = sortBy(
    await client.files
      .list({
        filter: {
          mimeType: 'application/pdf',
          metadata: {
            [`${LINE_LABEL_PREFIX}${lineNumber}`]: 'true',
          },
        },
      })
      .autoPagingToArray({
        limit: Infinity,
      }),
    (file) => file.externalId
  );

  return getWorkspaceDocuments(client, files);
};

const getLineReviewStateExternalIdByLineReviewId = (id: string) =>
  `linewalk-${id}-${VERSION}-state.json`;

export const getLineReviewState = async (
  client: CogniteClient,
  lineNumber: string
) => {
  try {
    const lineReviewState = await getJsonByExternalId<LineReviewState>(
      client,
      getLineReviewStateExternalIdByLineReviewId(lineNumber)
    );
    return lineReviewState;
  } catch (error) {
    return undefined;
  }
};

export const saveLineReviewState = async (
  client: CogniteClient,
  lineReview: LineReview,
  state: any
) => {
  try {
    const lineReviewState = await saveJsonByExternalId<LineReviewState>(
      client,
      getLineReviewStateExternalIdByLineReviewId(lineReview.id),
      state
    );
    return lineReviewState;
  } catch (error) {
    return undefined;
  }
};

export const updateLineReviews = async (
  client: CogniteClient,
  update: LineReview
) => {
  const lineReviews = await getLineReviews(client);
  await saveLineReviews(
    client,
    lineReviews.map((lineReview) => ({
      ...lineReview,
      ...(update.id === lineReview.id ? update : lineReview),
    }))
  );
};
