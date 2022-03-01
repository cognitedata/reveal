import {
  DocumentsClassifierCreate,
  DocumentsClassifier as Classifier,
  DocumentsClassifierListByIds,
  DocumentsClassifierListByIdsRequest,
} from '@cognite/sdk-playground';
import { CogniteClient, ListResponse } from '@cognite/sdk';

export const createDocumentClassifier = (
  sdk: CogniteClient,
  create: DocumentsClassifierCreate
) => {
  return sdk
    .post<ListResponse<Classifier[]>>(
      `/api/playground/projects/${sdk.project}/documents/classifiers`,
      {
        data: {
          items: [create],
        },
      }
    )
    .then((result) => {
      return result.data.items?.[0];
    })
    .catch((error) => {
      throw error;
    });
};

export const fetchDocumentClassifiers = (sdk: CogniteClient) => {
  return sdk
    .get<ListResponse<Classifier[]>>(
      `/api/playground/projects/${sdk.project}/documents/classifiers`
    )
    .then((result) => {
      return result.data.items;
    })
    .catch((error) => {
      throw error;
    });
};

export const fetchDocumentClassifierById = (sdk: CogniteClient, id: number) => {
  return fetchDocumentClassifierByIds(sdk, [{ id }]);
};

export const fetchDocumentClassifierByIds = (
  sdk: CogniteClient,
  ids: DocumentsClassifierListByIds[]
) => {
  const request: DocumentsClassifierListByIdsRequest = {
    items: ids,
  };
  return sdk
    .post<ListResponse<Classifier[]>>(
      `/api/playground/projects/${sdk.project}/documents/classifiers/byids`,
      {
        data: request,
      }
    )
    .then((result) => {
      return result.data.items?.[0];
    })
    .catch((error) => {
      throw error;
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
    })
    .catch((error) => {
      throw error;
    });
};
