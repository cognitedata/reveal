import { CadContextualizeThreeDViewer } from './components/Cad/CadContextualizeThreeDViewer';
import { PointCloudContextualizeThreeDViewer } from './components/PointCloud/PointCloudContextualizeThreeDViewer';
import { ThreeDModelType } from './types';

type ContextualizationViewerProps = {
  modelId: number;
  revisionId: number;
  modelType: ThreeDModelType;
};

export const ContextualizationViewer = ({
  modelType,
  modelId,
  revisionId,
}: ContextualizationViewerProps) => {
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
