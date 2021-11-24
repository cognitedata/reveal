import { Classifier } from '@cognite/sdk-playground';
import { CogniteClient, ListResponse } from '@cognite/sdk';

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

export const fetchDocumentClassifiers = (sdk: CogniteClient) => {
  return sdk
    .get<ListResponse<Classifier[]>>(
      `/api/playground/projects/${sdk.project}/documents/classifiers`
    )
    .then((result) => {
      return result.data.items;
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
