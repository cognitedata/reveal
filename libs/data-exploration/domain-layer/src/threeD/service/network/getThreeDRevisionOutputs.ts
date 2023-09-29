import { CogniteClient } from '@cognite/sdk';

import { ThreeDRevisionOutput } from '../types';

export const getThreeDRevisionOutputs = async (
  sdk: CogniteClient,
  modelId?: number,
  revisionId?: number,
  formats?: string
) => {
  let formatsQueryString: string = '';
  if (formats) {
    formatsQueryString = `?format=${formats}`;
  }
  return sdk
    .get(
      `${sdk.getBaseUrl()}/api/v1/projects/${
        sdk.project
      }/3d/models/${modelId}/revisions/${revisionId}/outputs${formatsQueryString}`
    )
    .then(
      (value: {
        data: {
          items: ThreeDRevisionOutput[];
        };
      }) => value?.data?.items
    );
};
