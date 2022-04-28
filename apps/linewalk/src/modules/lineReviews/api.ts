import {
  DIAGRAM_PARSER_SOURCE,
  DIAGRAM_PARSER_TYPE,
  getLineReviewEventExternalId,
  getVersionedParsedDocumentExternalId,
  LINE_REVIEW_EVENT_TYPE,
  lineNumberMetadataKey,
  LINEWALK_VERSION_KEY,
  versionedLineLabelPrefix,
} from '@cognite/pid-tools';
import type { CogniteClient, FileInfo } from '@cognite/sdk';
import zipWith from 'lodash/zipWith';
import * as PDFJS from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist/types/display/api';
import sortBy from 'lodash/sortBy';

import groupByArray from '../../utils/groupByArray';
import isNotUndefined from '../../utils/isNotUndefined';

import {
  LineReview,
  WorkspaceDocument,
  DocumentType,
  LineReviewStatus,
} from './types';

PDFJS.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js`;
const VERSION = '0.0.23';

export const getJsonsByExternalIds = async <T = unknown>(
  client: CogniteClient,
  externalIds: string[]
): Promise<T[]> => {
  if (externalIds.length === 0) {
    return [];
  }

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
  if (externalIds.length === 0) {
    return [];
  }

  const downloadUrls = await client.files.getDownloadUrls(
    externalIds.map((externalId) => ({ externalId }))
  );

  return Promise.all(
    downloadUrls.map(
      ({ downloadUrl }) => PDFJS.getDocument(downloadUrl).promise
    )
  );
};

type LineReviewEvent = {
  externalId: string;
  metadata: {
    assignee: string;
    lineNumber: string;
    status: LineReviewStatus;
    system: string;
    comment: string;
    state: string;
    unit: string;
  };
};

const lineReviewFromEvent = (
  event: LineReviewEvent,
  pdfExternalIds: string[]
): LineReview => {
  const state: { discrepancies: any; textAnnotations: any } = JSON.parse(
    event.metadata.state
  );
  return {
    id: event.metadata.lineNumber,
    name: event.metadata.lineNumber,
    assignee: event.metadata.assignee,
    status: event.metadata.status,
    system: event.metadata.system,
    comment: event.metadata.comment,
    unit: event.metadata.unit,
    discrepancies: state.discrepancies,
    textAnnotations: state.textAnnotations,
    pdfExternalIds,
  };
};

const lineNumbersFromFileMetadata = (file: FileInfo): string[] => {
  if (file.metadata === undefined) {
    throw new Error();
  }

  return Object.entries(file.metadata)
    .filter(
      ([key, value]) =>
        key.includes(versionedLineLabelPrefix(VERSION)) && value === 'true'
    )
    .map(([key]) => key)
    .map((key) => key.replace(versionedLineLabelPrefix(VERSION), ''));
};

export const getLineReviews = async (client: CogniteClient) => {
  const [lineReviewEvents, lineReviewFiles] = await Promise.all([
    client.events
      .list({
        filter: {
          metadata: {
            [LINEWALK_VERSION_KEY]: VERSION,
          },
          type: LINE_REVIEW_EVENT_TYPE,
        },
        sort: {
          createdTime: 'asc',
        },
      })
      .autoPagingToArray({ limit: Infinity }) as unknown as LineReviewEvent[],
    client.files
      .list({
        filter: {
          mimeType: 'application/pdf',
          metadata: {
            [LINEWALK_VERSION_KEY]: VERSION,
            [DIAGRAM_PARSER_SOURCE]: 'true',
          },
        },
      })
      .autoPagingToArray({ limit: Infinity }) as unknown as FileInfo[],
  ]);

  const lineReviewFilesByLineNumbers = groupByArray(
    lineReviewFiles,
    lineNumbersFromFileMetadata
  );

  const lineReviews = lineReviewEvents.map((event) =>
    lineReviewFromEvent(
      event,
      (lineReviewFilesByLineNumbers[event.metadata.lineNumber] ?? [])
        .map((file) => file.externalId)
        .filter(isNotUndefined)
    )
  );

  return lineReviews;
};

export const addLineNumberToDocumentMetadata = async (
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
            [lineNumberMetadataKey(VERSION, lineNumber)]: 'true',
          },
          remove: [],
        },
      },
    },
  ]);
};

export const removeLineNumberFromDocumentMetadata = async (
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
          remove: [lineNumberMetadataKey(VERSION, lineNumber)],
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
      file.metadata?.[getVersionedParsedDocumentExternalId(VERSION)];
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
            [LINEWALK_VERSION_KEY]: VERSION,
            [lineNumberMetadataKey(VERSION, lineNumber)]: 'true',
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

export const updateLineReview = async (
  client: CogniteClient,
  lineNumber: string,
  update: { comment: string; status: LineReviewStatus; state: any }
) =>
  client.events.update([
    {
      externalId: getLineReviewEventExternalId(VERSION, lineNumber),
      update: {
        metadata: {
          add: {
            comment: update.comment,
            status: update.status,
            state: JSON.stringify(update.state),
          },
          remove: [],
        },
      },
    },
  ]);
