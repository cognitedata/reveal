import { useCallback, useMemo, useState } from 'react';

import { DefaultNodeAppearance } from '@cognite/reveal';
import {
  AddResourceOptions,
  DefaultResourceStyling,
  Reveal3DResources,
  useClickedNodeData,
  Image360Details,
  FdmAssetStylingGroup,
} from '@cognite/reveal-react-components';

import { defaultResourceStyling } from '../../../constants/threeD';
import { useNavigateOnClick } from '../hooks/useNavigateOnClick';
import { useResetNodeDataOnNavigate } from '../hooks/useResetNodeDataOnNavigate';
import { useThreeDCameraNavigation } from '../hooks/useThreeDCameraNavigation';

import { PreviewCard } from './PreviewCard';
import { ToolBarContainer } from './ToolBarContainer';

interface Props {
  threeDResources: AddResourceOptions[];
  externalId?: string;
  instanceExternalId?: string;
  instanceSpace?: string;
  hideToolbar?: boolean;
  focusNode?: boolean;
  isInitialLoad?: boolean;
}
export const RevealContent = ({
  threeDResources,
  instanceExternalId,
  instanceSpace,
  hideToolbar,
  focusNode,
  isInitialLoad,
}: Props) => {
  const clickedNodeData = useClickedNodeData();
  const [resourceMounted, setResourcesMounted] = useState(false);
  const [hasOriginalCadColors, setHasOriginalCadColors] = useState(false);

  const instance =
    instanceExternalId !== undefined && instanceSpace !== undefined
      ? { externalId: instanceExternalId, space: instanceSpace }
      : undefined;

  const { loadInitialCameraState, focusInstance } = useThreeDCameraNavigation(
    isInitialLoad === true,
    instance
  );

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
    instanceExternalId,
    instanceSpace
  );

  const instanceStyling = computeInstanceStyling(
    instanceExternalId,
    instanceSpace
  );

  const handleResourcesAdded = useCallback(() => {
    setResourcesMounted(true);
    loadInitialCameraState();
  }, [loadInitialCameraState]);

  const handleToggleOriginalCadColors = () => {
    setHasOriginalCadColors((prev) => !prev);
  };

  return (
    <>
      {!hideToolbar && (
        <ToolBarContainer
          hasOriginalCadColors={hasOriginalCadColors}
          onToggleOriginalColors={handleToggleOriginalCadColors}
          focusAssetCallback={focusInstance}
        />
      )}
      <Reveal3DResources
        resources={threeDResources}
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
