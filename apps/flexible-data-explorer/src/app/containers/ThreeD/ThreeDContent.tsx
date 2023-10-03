import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import {
  RevealContainer,
  AddReveal3DModelOptions,
  useIsRevealInitialized,
} from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import { useSelectedInstanceParams } from '../../../app/hooks/useParams';
import { EmptyState } from '../../components/EmptyState';
import {
  defaultRevealColor,
  defaultViewerOptions,
} from '../../constants/threeD';
import { useSiteConfig } from '../../hooks/useConfig';
import { Instance } from '../../services/types';

import { MappedEquipmentContextHandler } from './containers/MappedEquipmentContextHandler';
import { RevealContent } from './containers/RevealContent';

interface Props {
  focusOnInstance?: boolean;
}

export const ThreeDContent: React.FC<Props> = ({ focusOnInstance }) => {
  const sdk = useSDK();
  const isRevealInitialized = useIsRevealInitialized();

  const siteConfig = useSiteConfig();

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
