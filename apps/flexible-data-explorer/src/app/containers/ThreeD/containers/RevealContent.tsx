import { useCallback, useMemo, useState } from 'react';

import { DefaultNodeAppearance } from '@cognite/reveal';
import {
  AddResourceOptions,
  DefaultResourceStyling,
  Reveal3DResources,
  useCameraNavigation,
  useClickedNodeData,
  Image360Details,
} from '@cognite/reveal-react-components';

import { defaultResourceStyling } from '../../../constants/threeD';

import { PreviewCard } from './PreviewCard';
import { ToolBarContainer } from './ToolBarContainer';

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
  const [hasOriginalCadColors, setHasOriginalCadColors] = useState(false);

  const currentDefaultResourceStyling: DefaultResourceStyling = useMemo(() => {
    return hasOriginalCadColors
      ? {
          cad: {
            default: DefaultNodeAppearance.Default,
            mapped: DefaultNodeAppearance.Default,
          },
        }
      : defaultResourceStyling;
  }, [hasOriginalCadColors]);

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

  const handleToggleOriginalCadColors = () => {
    setHasOriginalCadColors((prev) => !prev);
  };

  return (
    <>
      {!hideToolbar && (
        <ToolBarContainer
          hasOriginalCadColors={hasOriginalCadColors}
          onToggleOriginalColors={handleToggleOriginalCadColors}
        />
      )}
      <Reveal3DResources
        resources={modelIdentifiers}
        defaultResourceStyling={currentDefaultResourceStyling}
        instanceStyling={instanceStyling}
        onResourcesAdded={handleResourcesAdded}
      />
      {resourceMounted && <Image360Details />}
      {!nonInteractible && <PreviewCard nodeData={clickedNodeData} />}
    </>
  );
};
