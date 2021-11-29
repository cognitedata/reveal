import {
  Classifier,
  DocumentsPipeline,
  UpdateDocumentsPipeline,
} from '@cognite/sdk-playground';
import { CogniteClient, Label, ListResponse } from '@cognite/sdk';

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
    })
    .catch((error) => {
      throw error;
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
    })
    .catch((error) => {
      throw error;
    });
};
