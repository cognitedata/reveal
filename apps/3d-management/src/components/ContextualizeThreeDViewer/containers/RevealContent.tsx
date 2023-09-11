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
  return (
    <PointCloudContainer
      addModelOptions={{
        modelId: modelId,
        revisionId: revisionId,
      }}
      onLoad={(model) => viewer.fitCameraToModel(model)}
    />
  );
};
