import { useCallback, useMemo, useState } from 'react';

import { DefaultNodeAppearance } from '@cognite/reveal';
import {
  AddResourceOptions,
  Reveal3DResources,
  useCameraNavigation,
  useClickedNodeData,
  Image360Details,
} from '@cognite/reveal-react-components';

import { defaultResourceStyling } from '../../../constants/threeD';
import { StyledRevealToolBar } from '../components/ToolBar/StyledRevealToolBar';

import { PreviewCard } from './PreviewCard';

interface Props {
  modelIdentifiers: AddResourceOptions[];
  externalId?: string;
  instanceSpace?: string;
  fitCamera?: 'models' | 'instance';
  hideToolbar?: boolean;
  nonInteractible?: boolean;
}
export const RevealContent = ({
  modelIdentifiers,
  externalId,
  instanceSpace,
  fitCamera,
  hideToolbar,
  nonInteractible,
}: Props) => {
  const cameraNavigation = useCameraNavigation();
  const clickedNodeData = useClickedNodeData();
  const [resourceMounted, setResourcesMounted] = useState(false);

  const highlightingInstance =
    nonInteractible === true ? undefined : clickedNodeData?.fdmNode;

  const instanceStyling = useMemo(() => {
    if (highlightingInstance === undefined) {
      return [];
    } else {
      return [
        {
          fdmAssetExternalIds: [highlightingInstance],
          style: { cad: DefaultNodeAppearance.Highlighted },
        },
      ];
    }
  }, [highlightingInstance]);

  const handleResourcesAdded = useCallback(() => {
    setResourcesMounted(true);
    if (fitCamera === 'models') {
      return cameraNavigation.fitCameraToAllModels();
    }

    if (fitCamera === 'instance') {
      if (externalId && instanceSpace) {
        cameraNavigation.fitCameraToInstance(externalId, instanceSpace);
      }
    }
  }, [cameraNavigation, externalId, instanceSpace, fitCamera]);

  return (
    <>
      {!hideToolbar && <StyledRevealToolBar />}
      <Reveal3DResources
        resources={modelIdentifiers}
        defaultResourceStyling={defaultResourceStyling}
        instanceStyling={instanceStyling}
        onResourcesAdded={handleResourcesAdded}
      />
      {resourceMounted && <Image360Details />}
      {!nonInteractible && <PreviewCard nodeData={clickedNodeData} />}
    </>
  );
};
