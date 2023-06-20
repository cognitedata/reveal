import { CogniteClient } from '@cognite/sdk/dist/src';

export const getThreeDRevisions = (sdk: CogniteClient, modelId: number) => {
  return sdk.revisions3D
    .list(modelId)
    .autoPagingToArray({ limit: -1 })
    .then((res) =>
      res.map((r, rIndex) => ({ ...r, index: res.length - rIndex }))
    );
};
