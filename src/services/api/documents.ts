import { CogniteClient, Label, ListResponse } from '@cognite/sdk';
import {
  DocumentsAggregate,
  DocumentsPipeline,
  Document,
  DocumentsSearchWrapper,
  ExternalDocumentsSearch,
  Classifier,
  UpdateDocumentsPipeline,
} from '@cognite/sdk-playground';
import { DOCUMENTS_AGGREGATES } from 'services/constants';
import { DocumentSearchQuery } from 'services/types';
import { documentBuilder } from 'utils/builder';
import { parseArrayBufferToBase64 } from 'utils/parser';

export const createDocumentClassifier = (sdk: CogniteClient, name: string) => {
  return sdk
    .post<ListResponse<Classifier[]>>(
      `/api/playground/projects/${sdk.project}/documents/classifiers`,
      {
        data: {
          items: [{ name }],
        },
      }
    )
    .then((result) => {
      return result.data.items?.[0];
    });
};

export const fetchDocumentClassifierById = (sdk: CogniteClient, id: number) => {
  return sdk
    .post<ListResponse<Classifier[]>>(
      `/api/playground/projects/${sdk.project}/documents/classifiers/byids`,
      {
        data: {
          items: [{ id }],
        },
      }
    )
    .then((result) => {
      return result.data.items?.[0];
    });
};

export const deleteDocumentClassifier = (sdk: CogniteClient, id: number) => {
  return sdk
    .post(
      `/api/playground/projects/${sdk.project}/documents/classifiers/delete`,
      {
        data: {
          items: [{ id }],
        },
      }
    )
    .then((result) => {
      return result.data;
    });
};

export const fetchDocumentClassifiers = (sdk: CogniteClient) => {
  return sdk
    .get<ListResponse<Classifier[]>>(
      `/api/playground/projects/${sdk.project}/documents/classifiers`
    )
    .then((result) => {
      return result.data.items;
    });
};

export const fetchDocumentPipelines = (sdk: CogniteClient) => {
  return sdk
    .get<ListResponse<DocumentsPipeline[]>>(
      `/api/playground/projects/${sdk.project}/documents/pipelines`
    )
    .then((result) => result.data.items?.[0]);
};

export const updateDocumentPipelinesActiveClassifier = (
  sdk: CogniteClient,
  classifierId: number
) => {
  return sdk
    .post<ListResponse<Classifier[]>>(
      `/api/playground/projects/${sdk.project}/documents/pipelines/update`,
      {
        data: {
          items: [
            {
              externalId: 'default',
              classifier: {
                activeClassifierId: {
                  set: classifierId,
                },
              },
            },
          ],
        },
      }
    )
    .then((result) => {
      return result.data.items?.[0];
    });
};

export const updateDocumentPipelinesTrainingLabels = (
  sdk: CogniteClient,
  action: 'add' | 'remove',
  trainingLabels: Label[]
) => {
  return sdk
    .post<{ items: UpdateDocumentsPipeline[] }>(
      `/api/playground/projects/${sdk.project}/documents/pipelines/update`,
      {
        data: {
          items: [
            {
              classifier: {
                trainingLabels: {
                  [action]: trainingLabels,
                },
              },
            },
          ],
        },
      }
    )
    .then((result) => {
      return result.data.items;
    });
};

export const fetchDocumentAggregates = (sdk: CogniteClient) => {
  return sdk
    .post<{ aggregates?: DocumentsAggregate[] }>(
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
              name: DOCUMENTS_AGGREGATES.documentType.name,
              aggregate: 'count',
              groupBy: [DOCUMENTS_AGGREGATES.documentType.group],
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
    });
};

export const doDocumentSearch = (
  sdk: CogniteClient,
  query?: DocumentSearchQuery
) => {
  const filterBuilder = documentBuilder(query);

  return sdk
    .post<ListResponse<DocumentsSearchWrapper[]>>(
      `/api/playground/projects/${sdk.project}/documents/search`,
      {
        data: {
          ...filterBuilder,
        } as ExternalDocumentsSearch,
      }
    )
    .then((result) => {
      return result.data.items?.map(({ item }) => item);
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
    .then((result) => result.data.items);
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
    .then((result) => result.data.items?.[0]);
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
    .then((result) => parseArrayBufferToBase64(result.data));
};
