import { normalize } from 'domain/documents/internal/transformers/normalize';

import uniqueId from 'lodash/uniqueId';

import {
  FileInfo,
  FileLink,
  InternalId,
  ExternalId,
  DocumentSearchItem,
  DocumentSearchAggregate,
  DocumentSearchResponse,
} from '@cognite/sdk';

import {
  DocumentType,
  DocumentMetadata,
  DocumentResultFacets,
  DocumentsFacets,
} from 'modules/documentSearch/types';

import { getDocumentFixture } from './documents/getDocumentFixture';
import { createdAndLastUpdatedTime } from './log';

// this is the internal structure used for documents in Discover
export const getMockDocument: (
  extras?: Partial<DocumentType>,
  extraMeta?: Partial<DocumentMetadata>
) => DocumentType = (extras = {}, extraMeta = {}) => {
  const externalId = String(parseInt(uniqueId(), 10));
  const id = String(parseInt(uniqueId(), 10));

  return {
    ...normalize(getDocumentFixture()),
    id,
    externalId,
    doc: {
      ...getMockDocumentMetadata({ id, ...extraMeta }),
    },
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
    fileCategory: '',
    labels: [{ externalId: 'unclassified' }],
    location: '',
    author: '',
    title: '',
    created: '',
    modified: '',
    filesize: 1230000,
    topfolder: '',
    truncatedContent: '',
    ...extraMeta,
  };
};

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
  items: DocumentSearchItem[] = [],
  aggregates: DocumentSearchAggregate[] = []
): DocumentSearchResponse => ({
  items: items || [],
  aggregates: [
    {
      name: 'fileCategory',
      groups: [
        {
          group: [
            {
              property: ['type'],
              value: 'PDF',
            },
          ],
          count: 100,
        },
      ],
      total: 100,
    },
    {
      name: 'labels',
      groups: [
        {
          group: [
            {
              property: ['labels'],
              value: {
                externalId: 'TestId',
              },
            },
          ],
          count: 200,
        },
      ],
      total: 200,
    },
    {
      name: 'location',
      groups: [
        {
          group: [
            {
              property: ['sourceFile', 'source'],
              value: 'TestSource',
            },
          ],
          count: 300,
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
      name: 'pageCount',
      groups: [
        {
          count: 10,
          group: [
            {
              property: ['pageCount'],
              value: '1',
            },
          ],
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
  fileCategory: [
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
  fileCategory: [],
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
  fileCategory: [],
  labels: [],
  lastcreated: [],
  location: [],
  lastmodified: [],
  pageCount: [],
  ...extras,
});
