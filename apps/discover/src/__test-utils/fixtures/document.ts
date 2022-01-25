import uniqueId from 'lodash/uniqueId';

import { FileInfo, FileLink, InternalId, ExternalId } from '@cognite/sdk';
import { Document, DocumentsAggregatesResponse } from '@cognite/sdk-playground';

import { LAST_CREATED_KEY } from 'modules/documentSearch/constants';
import {
  DocumentType,
  DocumentMetadata,
  DocumentResultFacets,
  DocumentsFacets,
} from 'modules/documentSearch/types';

import { getMockGeometry } from './geometry';
import { createdAndLastUpdatedTime } from './log';

// this is the internal structure used for documents in Discover
export const getMockDocument: (
  extras?: Partial<DocumentType>,
  extraMeta?: Partial<DocumentMetadata>
) => DocumentType = (extras = {}, extraMeta = {}) => {
  const externalId = String(parseInt(uniqueId(), 10));
  const id = String(parseInt(uniqueId(), 10));

  return {
    id,
    externalId,
    doc: {
      ...getMockDocumentMetadata({ id, ...extraMeta }),
    },
    highlight: { content: [] },
    geolocation: null,
    directory: '/folder1/folder2/file.txt',
    filename: '',
    ...extras,
  };
};

export const getMockDocumentMetadata: (
  extraMeta?: Partial<DocumentMetadata>
) => DocumentMetadata = (extraMeta = {}) => {
  const id = String(parseInt(uniqueId(), 10));
  return {
    id,
    assetIds: [1234],
    filename: 'file',
    filepath: '/',
    filetype: '',
    labels: [{ externalId: 'unclassified' }],
    location: '',
    author: '',
    title: '',
    creationdate: '',
    lastmodified: '',
    filesize: 1230000,
    topfolder: '',
    truncatedContent: '',
    ...extraMeta,
  };
};

export const getMockApiResultItem = (
  extras = {},
  derivedExtras = {}
): Document => ({
  id: 123,
  externalId: 'aa123aa',
  createdTime: 1592472506240,
  language: 'en',
  type: 'PDF',
  title: 'Chapter 5 pressure tests.xlsx',
  geoLocation: getMockGeometry() as any, // Remove any once its fixed in sdk
  labels: [{ externalId: 'Unknown' }, { externalId: 'Label-1-ID' }],
  ...extras,

  sourceFile: {
    name: 'Pressure tests.pdf',
    assetIds: [1, 2, 3],
    directory: '/folder1/folder2',
    sourceCreatedTime: new Date(1396357617000),
    sourceModifiedTime: new Date(1396357617334),
    lastUpdatedTime: new Date(1396357617334),
    metadata: {
      parentPath: '/folder1/folder2',
      path: '/folder1/folder2/Pressure tests.pdf',
      fileName: 'Pressure tests.pdf',
    },
    ...derivedExtras,
  },
});

export const getMockFileLinkWithInternalId = (
  extras?: Partial<FileLink & InternalId>
): FileLink & InternalId => ({
  id: 12345,
  downloadUrl: 'https://download.url/type?id=internal',
  ...extras,
});

export const getMockFileLinkWithExternalId = (
  extras?: Partial<FileLink & ExternalId>
): FileLink & ExternalId => ({
  externalId: '12345',
  downloadUrl: 'https://download.url/type?id=external',
  ...extras,
});

export const getMockFileInfo = (extras?: Partial<FileInfo>): FileInfo => ({
  id: 12345,
  uploaded: false,
  name: 'test-file.pdf',
  ...createdAndLastUpdatedTime,
  ...extras,
});

export const getMockAPIResponse = (
  items: Document[] = [],
  aggregates: DocumentsAggregatesResponse<Document[]>['aggregates'] = []
): DocumentsAggregatesResponse<Document[]> => ({
  items: items || [],
  aggregates: [
    {
      name: 'filetype',
      groups: [
        {
          group: [{ type: 'PDF' }],
          value: 100,
        },
      ],
      total: 100,
    },
    {
      name: 'labels',
      groups: [
        {
          group: [{ labels: 'TestId' }],
          value: 200,
        },
      ],
      total: 200,
    },
    {
      name: 'location',
      groups: [
        {
          group: [{ 'sourceFile.source': 'TestSource' }],
          value: 300,
        },
      ],
      total: 300,
    },
    {
      name: 'total',
      total: 400,
      groups: [],
    },
    {
      name: 'lastcreated',
      groups: [
        {
          group: [{ [LAST_CREATED_KEY]: 1592472506240 }],
          value: 500,
        },
      ],
      total: 500,
    },
    {
      name: 'pageCount',
      groups: [
        {
          group: [{ pageCount: '1' }],
          value: 10,
        },
      ],
      total: 10,
    },
    ...(aggregates || []),
  ],
});

export const getMockDocumentFacets = (
  extras?: Partial<DocumentResultFacets>
): DocumentResultFacets => ({
  filetype: [
    {
      count: 100,
      key: 'PDF',
      name: 'PDF',
      selected: false,
    },
  ],
  labels: [
    {
      count: 200,
      key: 'TestId',
      name: 'TestId',
      selected: false,
    },
  ],
  total: [
    {
      count: 400,
      key: 'total',
      name: 'total',
      selected: false,
    },
  ],
  lastcreated: [
    {
      count: 500,
      key: '2020',
      name: '2020',
      selected: false,
    },
  ],
  location: [
    {
      count: 300,
      key: 'TestSource',
      name: 'TestSource',
      selected: false,
    },
  ],
  pageCount: [
    {
      name: '1',
      key: '1',
      count: 4,
    },
    {
      name: '2',
      key: '2',
      count: 2,
    },
    {
      name: '3',
      key: '3',
      count: 2,
    },
  ],
  ...extras,
});

export const getMockDocumentResultsEmptyFacets = (
  extras?: Partial<DocumentResultFacets>
): DocumentResultFacets => ({
  filetype: [],
  labels: [],
  total: [],
  lastcreated: [],
  location: [],
  pageCount: [],
  ...extras,
});

export const getMockDocumentEmptyFacets = (
  extras?: Partial<DocumentsFacets>
): DocumentsFacets => ({
  filetype: [],
  labels: [],
  lastcreated: [],
  location: [],
  lastmodified: [],
  pageCount: [],
  ...extras,
});
