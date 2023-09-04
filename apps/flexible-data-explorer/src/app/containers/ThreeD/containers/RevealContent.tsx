import { useCallback, useMemo, useState } from 'react';

import { DefaultNodeAppearance } from '@cognite/reveal';
import {
  AddResourceOptions,
  DefaultResourceStyling,
  Reveal3DResources,
  useCameraNavigation,
  useClickedNodeData,
  Image360Details,
  FdmAssetStylingGroup,
} from '@cognite/reveal-react-components';

import { defaultResourceStyling } from '../../../constants/threeD';
import { useNavigateOnClick } from '../hooks/useNavigateOnClick';
import { useResetNodeDataOnNavigate } from '../hooks/useResetNodeDataOnNavigate';

import { PreviewCard } from './PreviewCard';
import { ToolBarContainer } from './ToolBarContainer';

interface Props {
  modelIdentifiers: AddResourceOptions[];
  externalId?: string;
  instanceSpace?: string;
  fitCamera?: 'models' | 'instance';
  hideToolbar?: boolean;
  focusNode?: boolean;
}
export const RevealContent = ({
  modelIdentifiers,
  externalId,
  instanceSpace,
  fitCamera,
  hideToolbar,
  focusNode,
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

  const clickedNodeDataDisabledOnFocus =
    focusNode === true ? undefined : clickedNodeData;

  useNavigateOnClick(clickedNodeDataDisabledOnFocus);
  const previewCardNodeData = useResetNodeDataOnNavigate(
    clickedNodeDataDisabledOnFocus,
    externalId,
    instanceSpace
  );

  const instanceStyling = computeInstanceStyling(externalId, instanceSpace);

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

  const { fitCameraToInstance } = useCameraNavigation();

  const focusSelectedAsset = useCallback(() => {
    if (externalId !== undefined && instanceSpace !== undefined) {
      fitCameraToInstance(externalId, instanceSpace);
    }
  }, [externalId, instanceSpace]);

  return (
    <>
      {!hideToolbar && (
        <ToolBarContainer
          hasOriginalCadColors={hasOriginalCadColors}
          onToggleOriginalColors={handleToggleOriginalCadColors}
          focusAssetCallback={focusSelectedAsset}
        />
      )}
      <Reveal3DResources
        resources={modelIdentifiers}
        defaultResourceStyling={currentDefaultResourceStyling}
        instanceStyling={instanceStyling}
        onResourcesAdded={handleResourcesAdded}
      />
      {resourceMounted && <Image360Details />}
      {!focusNode && <PreviewCard nodeData={previewCardNodeData} />}
    </>
  );
};

function computeInstanceStyling(
  externalId: string | undefined,
  space: string | undefined
): FdmAssetStylingGroup[] | undefined {
  if (externalId !== undefined && space !== undefined) {
    return [
      {
        fdmAssetExternalIds: [{ externalId, space }],
        style: { cad: DefaultNodeAppearance.Highlighted },
      },
    ];
  }

  return [];
}
