import { useCallback, useMemo, useState } from 'react';

import {
  defaultResourceStyling,
  resultStyling,
} from '@fdx/shared/constants/threeD';
import { useSearchQueryParams } from '@fdx/shared/hooks/useParams';
import { Instance } from '@fdx/shared/types/services';
import { Vector3 } from 'three';

import { getLanguage } from '@cognite/cdf-i18n-utils';
import { DefaultNodeAppearance } from '@cognite/reveal';
import {
  AddResourceOptions,
  DefaultResourceStyling,
  Reveal3DResources,
  Image360Details,
  FdmAssetStylingGroup,
} from '@cognite/reveal-react-components';

import { useHandleSelectedInstance } from '../hooks/useHandleSelectedInstance';
import { useInitialCameraNavigation } from '../hooks/useInitialCameraNavigation';
import { useSearchMappedEquipment } from '../providers/Mapped3DEquipmentProvider';
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
  const appLanguage = getLanguage();

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

  const shouldStyleSearchResult =
    disablePreviewCard !== undefined ? !disablePreviewCard : true;
  const searchResultStyling = useSearchResultStyling(shouldStyleSearchResult);

  const instanceStyling = [
    ...(computeInstanceStyling(instanceExternalId, instanceSpace) ?? []),
    ...searchResultStyling,
  ];

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
      {resourceMounted && <Image360Details appLanguage={appLanguage} />}
      {!disablePreviewCard && <PreviewCard nodeData={selectedInstance} />}
    </>
  );
};

const useSearchResultStyling = (enable: boolean) => {
  const mappedEquipmentSearchResult = useSearchMappedEquipment(enable);
  const [query] = useSearchQueryParams();

  return useMemo<FdmAssetStylingGroup[]>(() => {
    if (mappedEquipmentSearchResult?.data === undefined || query === '') {
      return [];
    }

    const fdmIds = [...Object.values(mappedEquipmentSearchResult.data)].flatMap(
      (v) => v.items
    );
    return [
      {
        fdmAssetExternalIds: fdmIds,
        style: {
          cad: resultStyling.cad,
        },
      },
    ];
  }, [mappedEquipmentSearchResult]);
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
