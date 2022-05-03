import {
  DIAGRAM_PARSER_SOURCE,
  DIAGRAM_PARSER_TYPE,
  getLineReviewEventExternalId,
  LINE_REVIEW_EVENT_TYPE,
  getLineNumberKey,
  LINEWALK_VERSION_KEY,
  getLineLabelPrefix,
  GraphDocument,
  getGraphExternalIdKey,
  parseGraphs,
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
  ParsedDocument,
} from './types';

PDFJS.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js`;

export const LINEWALK_FRONTEND_VERSION = '0.0.19';

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
        key.includes(getLineLabelPrefix(LINEWALK_FRONTEND_VERSION)) &&
        value === 'true'
    )
    .map(([key]) => key)
    .map((key) =>
      key.replace(getLineLabelPrefix(LINEWALK_FRONTEND_VERSION), '')
    );
};

export const getLineReviews = async (client: CogniteClient) => {
  const [lineReviewEvents, lineReviewFiles] = await Promise.all([
    client.events
      .list({
        filter: {
          metadata: {
            [LINEWALK_VERSION_KEY]: LINEWALK_FRONTEND_VERSION,
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

  const lineReviews = sortBy(
    lineReviewEvents.map((event) =>
      lineReviewFromEvent(
        event,
        (lineReviewFilesByLineNumbers[event.metadata.lineNumber] ?? [])
          .map((file) => file.externalId)
          .filter(isNotUndefined)
      )
    ),
    (lineReview) => lineReview.name
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
            [getLineNumberKey(LINEWALK_FRONTEND_VERSION, lineNumber)]: 'true',
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
          remove: [getLineNumberKey(LINEWALK_FRONTEND_VERSION, lineNumber)],
        },
      },
    },
  ]);
};

export const getWorkspaceDocuments = async (
  client: CogniteClient,
  files: FileInfo[]
): Promise<WorkspaceDocument[]> => {
  const pdfDocuments = await getPdfsByExternalIds(
    client,
    files.map(({ externalId }) => externalId).filter(isNotUndefined)
  );

  const workspaceDocuments: WorkspaceDocument[] = zipWith<
    FileInfo,
    PDFDocumentProxy,
    WorkspaceDocument
  >(files, pdfDocuments, (file, pdf) => {
    const type = file.metadata?.[DIAGRAM_PARSER_TYPE] as
      | DocumentType
      | undefined;
    const pdfExternalId = file.externalId;
    if (type === undefined) {
      throw new Error('Missing type');
    }

    if (pdfExternalId === undefined) {
      throw new Error('Missing pdf external id');
    }

    return {
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
            [getLineNumberKey(LINEWALK_FRONTEND_VERSION, lineNumber)]: 'true',
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
      externalId: getLineReviewEventExternalId(
        LINEWALK_FRONTEND_VERSION,
        lineNumber
      ),
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

export const getGraphsByWorkspaceDocuments = async (
  client: CogniteClient,
  documents: WorkspaceDocument[]
) => {
  const pdfFileInfos = await client.files.retrieve(
    documents.map((document) => ({
      externalId: document.pdfExternalId,
    }))
  );

  // eslint-disable-next-line no-await-in-loop
  const graphs: GraphDocument[] = await getJsonsByExternalIds(
    client,
    pdfFileInfos
      .map(
        (fileInfo) =>
          fileInfo.metadata?.[getGraphExternalIdKey(LINEWALK_FRONTEND_VERSION)]
      )
      .filter(isNotUndefined)
  );

  return graphs;
};

export const getParsedDocumentsByWorkspaceDocuments = async (
  client: CogniteClient,
  documents: WorkspaceDocument[]
): Promise<ParsedDocument[]> => {
  const graphs = await getGraphsByWorkspaceDocuments(client, documents);
  const parsedFiles = await parseGraphs(graphs);
  const parsedDocuments = parsedFiles.map(
    (parsedFile) => parsedFile.data
  ) as unknown as ParsedDocument[];
  return parsedDocuments;
};
