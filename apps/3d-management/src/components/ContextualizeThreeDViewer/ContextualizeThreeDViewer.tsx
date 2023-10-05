import { useEffect, useState } from 'react';

import { useSDK } from '@cognite/sdk-provider';

import { CadContextualizeThreeDViewer } from './components/Cad/CadContextualizeThreeDViewer';
import { PointCloudContextualizeThreeDViewer } from './components/PointCloud/PointCloudContextualizeThreeDViewer';
import { ThreeDModelType } from './types';
import { getThreeDModelType } from './utils/getThreeDModelType';

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
    const loadThreeDModel = async () => {
      const threeDModel = await getThreeDModelType(sdk, modelId, revisionId);
      setModelType(threeDModel);
    };

    loadThreeDModel();
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
