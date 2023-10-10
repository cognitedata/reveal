import { CadContextualizeThreeDViewer } from './components/Cad/CadContextualizeThreeDViewer';
import { PointCloudContextualizeThreeDViewer } from './components/PointCloud/PointCloudContextualizeThreeDViewer';
import { ThreeDModelType } from './types';

type ContextualizeThreeDViewerModelTypeProps = {
  modelId: number;
  revisionId: number;
  modelType: ThreeDModelType;
};

export const ContextualizeThreeDViewerModelType = ({
  modelType,
  modelId,
  revisionId,
}: ContextualizeThreeDViewerModelTypeProps) => {
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

  return;
};
