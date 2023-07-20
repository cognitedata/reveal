import { getProject } from '@cognite/cdf-utilities';
import { CogniteClient, Label, ListResponse } from '@cognite/sdk';
import {
  DocumentsClassifier,
  DocumentsPipeline,
  DocumentsPipelineUpdate,
} from '@cognite/sdk-playground';

export const createDocumentPipeline = (
  sdk: CogniteClient,
  classifierName: string
) => {
  const project = getProject();
  return sdk
    .post<ListResponse<DocumentsPipeline[]>>(
      `/api/playground/projects/${project}/documents/pipelines`,
      {
        data: {
          items: [
            {
              classifier: {
                name: classifierName,
                trainingLabels: [],
              },
            } as DocumentsPipeline,
          ],
        },
      }
    )
    .then((result) => result.data.items?.[0]);
};

export const fetchDocumentPipelines = async (sdk: CogniteClient) => {
  const project = getProject();
  const result = await sdk.get<ListResponse<DocumentsPipeline[]>>(
    `/api/playground/projects/${project}/documents/pipelines`
  );

  let pipeline = result.data.items?.[0];

  // If a project doesn't have any configured pipeline configurations, create a default one.
  if (!pipeline) {
    pipeline = await createDocumentPipeline(sdk, 'Document Type');
  }

  return pipeline;
};

export const updateDocumentPipelinesActiveClassifier = (
  sdk: CogniteClient,
  classifierId: number
) => {
  const project = getProject();
  return sdk
    .post<ListResponse<DocumentsClassifier[]>>(
      `/api/playground/projects/${project}/documents/pipelines/update`,
      {
        data: {
          items: [
            {
              externalId: 'default',
              update: {
                classifier: {
                  modify: {
                    activeClassifierId: {
                      set: classifierId,
                    },
                  },
                },
              },
            } as DocumentsPipelineUpdate,
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
  const project = getProject();
  return sdk
    .post<{ items: DocumentsPipeline[] }>(
      `/api/playground/projects/${project}/documents/pipelines/update`,
      {
        data: {
          items: [
            {
              externalId: 'default',
              update: {
                classifier: {
                  modify: {
                    trainingLabels: {
                      [action]: trainingLabels,
                    },
                  },
                },
              },
            } as DocumentsPipelineUpdate,
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
