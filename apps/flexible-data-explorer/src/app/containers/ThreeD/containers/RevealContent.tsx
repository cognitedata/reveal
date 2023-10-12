import { useCallback, useMemo, useState } from 'react';

import { Vector3 } from 'three';

import { DefaultNodeAppearance } from '@cognite/reveal';
import {
  AddResourceOptions,
  DefaultResourceStyling,
  Reveal3DResources,
  Image360Details,
  FdmAssetStylingGroup,
} from '@cognite/reveal-react-components';

import { defaultResourceStyling } from '../../../constants/threeD';
import { Instance } from '../../../services/types';
import { useHandleSelectedInstance } from '../hooks/useHandleSelectedInstance';
import { useInitialCameraNavigation } from '../hooks/useInitialCameraNavigation';
import { createInstanceIfDefined } from '../utils';

import { PreviewCard } from './PreviewCard';
import { ToolBarContainer } from './ToolBarContainer';

export type InstanceWithPosition = Instance & {
  threeDPosition: Vector3;
};
interface Props {
  threeDResources: AddResourceOptions[];
  instanceExternalId?: string;
  instanceSpace?: string;
  dataType?: string;
  hideToolbar?: boolean;
  focusNode?: boolean;
  disablePreviewCard?: boolean;
  isInitialLoad?: boolean;
}

export const RevealContent = ({
  threeDResources,
  instanceExternalId,
  dataType,
  instanceSpace,
  hideToolbar,
  focusNode,
  disablePreviewCard,
  isInitialLoad,
}: Props) => {
  const [resourceMounted, setResourcesMounted] = useState(false);
  const [hasOriginalCadColors, setHasOriginalCadColors] = useState(false);

  const instance = createInstanceIfDefined(instanceExternalId, instanceSpace);

  const { loadInitialCameraState, focusInstance } = useInitialCameraNavigation(
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

  const selectedInstance = useHandleSelectedInstance(
    instanceExternalId,
    instanceSpace,
    dataType,
    focusInstance,
    focusNode
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
      {!disablePreviewCard && <PreviewCard nodeData={selectedInstance} />}
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
