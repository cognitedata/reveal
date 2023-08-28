import { useParams } from 'react-router-dom';

import { RevealContainer } from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import { EmptyState } from '../../components/EmptyState';
import {
  defaultRevealColor,
  defaultViewerOptions,
} from '../../constants/threeD';
import { useSiteConfig } from '../../hooks/useConfig';

import { RevealContent } from './containers/RevealContent';

export const ThreeDContent = () => {
  const sdk = useSDK();

  const siteConfig = useSiteConfig();

  const modelIdentifiers = siteConfig?.threeDResources;

  const { instanceSpace, externalId } = useParams();

  if (!modelIdentifiers) {
    return (
      <EmptyState
        title="No 3D models found"
        body="Please contact your administrator to configure 3D models"
      />
    );
  }

  const hasSpecifiedInstance =
    instanceSpace !== undefined && externalId !== undefined;
  const fitCameraMode = hasSpecifiedInstance ? 'instance' : 'models';

  return (
    <RevealContainer
      sdk={sdk}
      color={defaultRevealColor}
      viewerOptions={defaultViewerOptions}
    >
      <RevealContent
        modelIdentifiers={modelIdentifiers}
        externalId={externalId}
        instanceSpace={instanceSpace}
        fitCamera={fitCameraMode}
      />
    </RevealContainer>
  );
};
