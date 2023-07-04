import { Color } from 'three';

import {
  RevealContainer,
  Reveal3DResources,
  CameraController,
} from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import { useProjectConfig } from '../../hooks/useProjectConfig';

export const ThreeDContent = () => {
  const sdk = useSDK();
  return (
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4b)}>
      <ThreeDResources />
      <CameraController initialFitCamera={{ to: 'allModels' }} />
    </RevealContainer>
  );
};

const ThreeDResources: React.FC = () => {
  const projectConfigs = useProjectConfig();

  const modelIdentifiers = projectConfigs?.threeDResources;

  if (!modelIdentifiers) {
    return null;
  }

  return <Reveal3DResources resources={modelIdentifiers} />;
};
