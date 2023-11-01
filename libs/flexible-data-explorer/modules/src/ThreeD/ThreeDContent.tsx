import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { EmptyState } from '@fdx/components';
import {
  defaultRevealColor,
  defaultViewerOptions,
} from '@fdx/shared/constants/threeD';
import { useSelectedSiteConfig } from '@fdx/shared/hooks/useConfig';
import { useSelectedInstanceParams } from '@fdx/shared/hooks/useParams';
import { Instance } from '@fdx/shared/types/services';

import { getLanguage } from '@cognite/cdf-i18n-utils';
import {
  RevealContainer,
  AddReveal3DModelOptions,
  useIsRevealInitialized,
} from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import { MappedEquipmentContextHandler } from './modules/MappedEquipmentContextHandler';
import { RevealContent } from './modules/RevealContent';

interface Props {
  focusOnInstance?: boolean;
}

export const ThreeDContent: React.FC<Props> = ({ focusOnInstance }) => {
  const sdk = useSDK();
  const appLanguage = getLanguage();
  const isRevealInitialized = useIsRevealInitialized();

  const siteConfig = useSelectedSiteConfig();

  const threeDResources = siteConfig?.threeDResources;

  const { instanceSpace, externalId, dataType } = useParams();
  const [selectedInstance] = useSelectedInstanceParams();

  const currentInstance: Partial<Instance> | undefined =
    externalId === undefined
      ? selectedInstance
      : { externalId, instanceSpace, dataType };

  const threeDModels = useMemo(
    () =>
      threeDResources?.filter(
        (resource): resource is AddReveal3DModelOptions =>
          !('siteId' in resource)
      ) ?? [],
    [threeDResources]
  );

  if (threeDResources === undefined) {
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
      appLanguage={appLanguage}
    >
      <MappedEquipmentContextHandler modelsOptions={threeDModels} />
      <RevealContent
        threeDResources={threeDResources}
        dataType={currentInstance?.dataType}
        instanceExternalId={currentInstance?.externalId}
        instanceSpace={currentInstance?.instanceSpace}
        isInitialLoad={!isRevealInitialized}
        focusNode={focusOnInstance}
      />
    </RevealContainer>
  );
};
