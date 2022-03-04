import { CogniteClient, ListResponse } from '@cognite/sdk';
import {
  Document,
  DocumentsSearchRequest,
  DocumentsSearchResponse,
} from '@cognite/sdk-playground';
import { DOCUMENTS_AGGREGATES } from 'services/constants';
import { DocumentSearchQuery } from 'services/types';
import { documentBuilder } from 'utils/builder';
import { parseArrayBufferToBase64 } from 'utils/parser';

export const fetchDocumentAggregates = (sdk: CogniteClient) => {
  return sdk
    .post<DocumentsSearchResponse>(
      `/api/playground/projects/${sdk.project}/documents/search`,
      {
        data: {
          aggregates: [
            {
              name: DOCUMENTS_AGGREGATES.labels.name,
              aggregate: 'count',
              groupBy: [DOCUMENTS_AGGREGATES.labels.group],
            },
            {
              name: DOCUMENTS_AGGREGATES.fileType.name,
              aggregate: 'count',
              groupBy: [DOCUMENTS_AGGREGATES.fileType.group],
            },
            {
              name: DOCUMENTS_AGGREGATES.source.name,
              aggregate: 'count',
              groupBy: [DOCUMENTS_AGGREGATES.source.group],
            },
          ],
          limit: 0,
        },
      }
    )
    .then((result) => {
      return result.data.aggregates;
    })
    .catch((error) => {
      throw error;
    });
};

export const doDocumentSearch = (
  sdk: CogniteClient,
  query?: DocumentSearchQuery
) => {
  const filterBuilder = documentBuilder(query);

  return sdk
    .post<DocumentsSearchResponse>(
      `/api/playground/projects/${sdk.project}/documents/search`,
      {
        data: {
          ...filterBuilder,
        } as DocumentsSearchRequest,
      }
    )
    .then((result) => {
      return result.data.items?.map(({ item }) => item);
    })
    .catch((error) => {
      throw error;
    });
};

export const fetchDocumentList = (sdk: CogniteClient, externalId: string) => {
  return sdk
    .post<ListResponse<Document[]>>(
      `/api/playground/projects/${sdk.project}/documents/list`,
      {
        data: {
          filter: {
            labels: {
              containsAny: [
                {
                  externalId,
                },
              ],
            },
          },
        },
      }
    )
    .then((result) => result.data.items)
    .catch((error) => {
      throw error;
    });
};

export const fetchDocumentById = (sdk: CogniteClient, documentId: number) => {
  return sdk
    .post<ListResponse<Document[]>>(
      `/api/playground/projects/${sdk.project}/documents/list`,
      {
        data: {
          filter: {
            id: { in: [documentId] },
          },
        },
      }
    )
    .then((result) => result.data.items?.[0])
    .catch((error) => {
      throw error;
    });
};

export const previewDocument = (
  sdk: CogniteClient,
  documentId?: number,
  page: 0 | 1 | 2 = 0
) => {
  return sdk
    .get<ArrayBuffer>(
      `/api/playground/projects/${sdk.project}/documents/preview`,
      {
        params: {
          documentId,
          page,
        },
        responseType: 'arraybuffer',
        headers: {
          Accept: 'image/png',
        },
      }
    )
    .then((result) => parseArrayBufferToBase64(result.data))
    .catch((error) => {
      throw error;
    });
};
