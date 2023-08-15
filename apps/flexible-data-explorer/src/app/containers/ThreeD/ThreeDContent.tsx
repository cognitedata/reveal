import { ComponentProps } from 'react';

import { Color } from 'three';

import {
  RevealContainer,
  Reveal3DResources,
  CameraController,
} from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import { EmptyState } from '../../components/EmptyState';
import { useProjectConfig } from '../../hooks/useProjectConfig';

import { StyledRevealToolBar } from './components/ToolBar/StyledRevealToolBar';

const defaultViewerOptions: ComponentProps<
  typeof RevealContainer
>['viewerOptions'] = {
  loadingIndicatorStyle: {
    placement: 'topRight',
    opacity: 0.2,
  },
};

const defaultResourceStyling = {
  cad: {
    default: { color: new Color('#efefef') },
    mapped: { color: new Color('#c5cbff') },
  },
};

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
      color={new Color(0x4a4a4b)}
      viewerOptions={defaultViewerOptions}
    >
      <StyledRevealToolBar />
      <Reveal3DResources
        resources={modelIdentifiers}
        defaultResourceStyling={defaultResourceStyling}
      />
      <CameraController initialFitCamera={{ to: 'allModels' }} />
    </RevealContainer>
  );
};
