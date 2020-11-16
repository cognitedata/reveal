import { v3, v3Client } from '@cognite/cdf-sdk-singleton';

export interface RevisionLog3D {
  timestamp: number;
  severity: 3 | 5 | 7;
  type: string;
  info: string;
}

export async function isReprocessingRequired(modelId: number) {
  const url = `${v3Client.getBaseUrl()}/api/playground/projects/${
    v3Client.project
  }/3d/v2/outputs`;

  // fixme: create SDK methods
  const response = await v3Client.post(url, {
    data: {
      models: [{ id: modelId }],
      formats: ['ept-pointcloud', 'reveal-directory'],
    },
  });
  if (response.status !== 200) {
    throw new v3.HttpError(response.status, response.data, response.headers);
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
  const url = `${v3Client.getBaseUrl()}/api/playground/projects/${project}/3d/v2/models/reprocess`;
  const response = await v3Client.post(url, {
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
    throw new v3.HttpError(response.status, response.data, response.headers);
  }
}
