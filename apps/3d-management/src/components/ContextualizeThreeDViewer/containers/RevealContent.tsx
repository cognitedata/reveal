import { DefaultCameraManager, CogniteModel } from '@cognite/reveal';
import {
  useReveal,
  PointCloudContainer,
} from '@cognite/reveal-react-components';

interface RevealContentProps {
  modelId: number;
  revisionId: number;
}

export const RevealContent = ({ modelId, revisionId }: RevealContentProps) => {
  const viewer = useReveal();

  const handleOnLoad = (model: CogniteModel) => {
    viewer.fitCameraToModel(model);
    if (!(viewer.cameraManager instanceof DefaultCameraManager)) {
      console.warn(
        'Camera manager is not DefaultCameraManager, so click to change camera target will not work.'
      );
      return;
    }

    viewer.cameraManager.setCameraControlsOptions({
      changeCameraTargetOnClick: true,
      mouseWheelAction: 'zoomToCursor',
    });
  };

  return (
    <PointCloudContainer
      addModelOptions={{
        modelId: modelId,
        revisionId: revisionId,
      }}
      onLoad={handleOnLoad}
    />
  );
};
