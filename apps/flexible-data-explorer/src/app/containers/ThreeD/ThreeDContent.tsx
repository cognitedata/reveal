import { useParams } from 'react-router-dom';

import {
  RevealContainer,
  useIsRevealInitialized,
} from '@cognite/reveal-react-components';
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
  const isRevealInitialized = useIsRevealInitialized();

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

  return (
    <RevealContainer
      sdk={sdk}
      color={defaultRevealColor}
      viewerOptions={defaultViewerOptions}
    >
      <RevealContent
        modelIdentifiers={modelIdentifiers}
        instanceExternalId={externalId}
        instanceSpace={instanceSpace}
        isInitialLoad={!isRevealInitialized}
      />
    </RevealContainer>
  );
};
