import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import {
  RevealContainer,
  AddReveal3DModelOptions,
  useIsRevealInitialized,
} from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import { EmptyState } from '../../components/EmptyState';
import {
  defaultRevealColor,
  defaultViewerOptions,
} from '../../constants/threeD';
import { useSiteConfig } from '../../hooks/useConfig';

import { MappedEquipmentContextHandler } from './containers/MappedEquipmentContextHandler';
import { RevealContent } from './containers/RevealContent';

export const ThreeDContent: React.FC = () => {
  const sdk = useSDK();
  const isRevealInitialized = useIsRevealInitialized();

  const siteConfig = useSiteConfig();

  const threeDResources = siteConfig?.threeDResources;

  const { instanceSpace, externalId } = useParams();

  const threeDModels = useMemo(
    () =>
      threeDResources?.filter(
        (resource): resource is AddReveal3DModelOptions =>
          !('siteId' in resource)
      ) ?? [],
    [threeDResources]
  );

  if (!threeDResources) {
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
      <MappedEquipmentContextHandler modelsOptions={threeDModels} />
      <RevealContent
        threeDResources={threeDResources}
        externalId={externalId}
        instanceExternalId={externalId}
        instanceSpace={instanceSpace}
        isInitialLoad={!isRevealInitialized}
      />
    </RevealContainer>
  );
};
