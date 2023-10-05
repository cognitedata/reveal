import { getThreeDRevisionOutputs } from '@data-exploration-lib/domain-layer';

import { ThreeDModelType } from '../types';

// call the sdk.get() to retrieve the outputs and check the model type with the url:
// '/api/v1/projects/${getProject()}/3d/models/${modelId}/revisions/${revisionId}/outputs?format=all-outputs'
export const getThreeDModelType = async (
  sdk,
  modelId,
  revisionId
): Promise<ThreeDModelType> => {
  const response = await getThreeDRevisionOutputs(
    sdk,
    modelId,
    revisionId,
    'all-outputs'
  );
  if (response.find((item) => item.format === 'ept-pointcloud')) {
    return ThreeDModelType.POINT_CLOUD;
  } else {
    return ThreeDModelType.CAD;
  }
};
