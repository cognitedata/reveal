import { RevealContainer } from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import { EmptyState } from '../../components/EmptyState';
import {
  defaultRevealColor,
  defaultViewerOptions,
} from '../../constants/threeD';
import { useProjectConfig } from '../../hooks/useProjectConfig';

import { RevealContent } from './containers/RevealContent';

export const ThreeDContent = () => {
  const sdk = useSDK();

  const projectConfigs = useProjectConfig();

  const modelIdentifiers = projectConfigs?.threeDResources;

  if (!modelIdentifiers) {
    return (
      <EmptyState
        title="No 3D models found"
        body="Please contact your administrator to configure 3D models"
      />
    );
  }

  return (
    <RevealContainer
      sdk={sdk}
      color={defaultRevealColor}
      viewerOptions={defaultViewerOptions}
    >
      <RevealContent modelIdentifiers={modelIdentifiers} fitCamera="models" />
    </RevealContainer>
  );
};
