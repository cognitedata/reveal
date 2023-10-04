import { useEffect, useState } from 'react';

import { useSDK } from '@cognite/sdk-provider';

import { getThreeDRevisionOutputs } from '@data-exploration-lib/domain-layer';

import { CadContextualizeThreeDViewer } from './components/Cad/CadContextualizeThreeDViewer';
import { PointCloudContextualizeThreeDViewer } from './components/PointCloud/PointCloudContextualizeThreeDViewer';
import { ThreeDModelType } from './types';

type ContextualizeThreeDViewerProps = {
  modelId: number;
  revisionId: number;
};

export const ContextualizeThreeDViewer = ({
  modelId,
  revisionId,
}: ContextualizeThreeDViewerProps) => {
  const sdk = useSDK();

  const [modelType, setModelType] = useState(ThreeDModelType.NONE);

  useEffect(() => {
    (async () => {
      // call the sdk.get() to retrieve the outputs and check the model type with the url:
      // '/api/v1/projects/${getProject()}/3d/models/${modelId}/revisions/${revisionId}/outputs?format=all-outputs'
      const response = await getThreeDRevisionOutputs(
        sdk,
        modelId,
        revisionId,
        'all-outputs'
      );
      if (response.find((item) => item.format === 'ept-pointcloud')) {
        setModelType(ThreeDModelType.POINT_CLOUD);
      } else {
        setModelType(ThreeDModelType.CAD);
      }
    })();
  }, [sdk, modelId, revisionId]);

  if (modelType === ThreeDModelType.CAD) {
    return (
      <CadContextualizeThreeDViewer
        modelId={Number(modelId)}
        revisionId={Number(revisionId)}
      />
    );
  }

  if (modelType === ThreeDModelType.POINT_CLOUD) {
    return (
      <PointCloudContextualizeThreeDViewer
        modelId={Number(modelId)}
        revisionId={Number(revisionId)}
      />
    );
  }

  return <></>;
};
