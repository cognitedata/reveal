import sdk from '@cognite/cdf-sdk-singleton';
import { HttpError } from '@cognite/sdk';

export interface RevisionLog3D {
  timestamp: number;
  severity: 3 | 5 | 7;
  type: string;
  info: string;
}

export type NodePropertyFilterType = {
  [category: string]: {
    [key: string]: string;
  };
};

type OutputFormats = 'ept-pointcloud' | 'reveal-directory';
export type RevisionOutputsRequestBody = {
  models: [{ id: number }];
  formats: Array<OutputFormats>;
};
export async function isReprocessingRequired(modelId: number) {
  const url = `${sdk.getBaseUrl()}/api/playground/projects/${
    sdk.project
  }/3d/v2/outputs`;

  // fixme: create SDK methods
  const requestBody: RevisionOutputsRequestBody = {
    models: [{ id: modelId }],
    formats: ['ept-pointcloud', 'reveal-directory'],
  };
  const response = await sdk.post(url, {
    data: requestBody,
  });
  if (response.status !== 200) {
    throw new HttpError(response.status, response.data, response.headers);
  }
  const { outputs } = response.data.items[0];
  return !outputs.length;
}

type RequestReprocessingArgs = {
  project: string;
  modelId: number;
  revisionId: number;
};

export async function requestReprocessing({
  project,
  modelId,
  revisionId,
}: RequestReprocessingArgs): Promise<void> {
  const url = `${sdk.getBaseUrl()}/api/playground/projects/${project}/3d/v2/models/reprocess`;
  const response = await sdk.post(url, {
    data: {
      items: [
        {
          modelId,
          revisionId,
        },
      ],
    },
  });

  if (response.status !== 200) {
    throw new HttpError(response.status, response.data, response.headers);
  }
}
