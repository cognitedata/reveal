import { CogniteClient } from '@cognite/sdk';

import { ThreeDRevisionOutput } from '@data-exploration-lib/domain-layer';

export const getThreeDRevisionOutputs = async (
  sdk: CogniteClient,
  modelId?: number,
  revisionId?: number
) => {
  return sdk
    .get(
      `${sdk.getBaseUrl()}/api/v1/projects/${
        sdk.project
      }/3d/models/${modelId}/revisions/${revisionId}/outputs`
    )
    .then(
      (value: {
        data: {
          items: ThreeDRevisionOutput[];
        };
      }) => value?.data?.items
    );
};
