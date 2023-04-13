import { createLink } from '@cognite/cdf-utilities';
import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';
import {
  getResourceIdFromExtendedAnnotation,
  isAssetAnnotation,
} from '@cognite/data-exploration';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';

import { useMemo } from 'react';
import AssetTooltip from '../components/ContextualTooltips/AssetTooltip';
import { ContainerReferenceType } from '../types';
import { OnAddContainerReferences } from './useIndustryCanvasAddContainerReferences';

const useIndustryCanvasAssetTooltips = (
  selectedAnnotation: ExtendedAnnotation | undefined,
  onAddContainerReferences: OnAddContainerReferences
) => {
  return useMemo(() => {
    if (selectedAnnotation === undefined) {
      return [];
    }

    const resourceId = getResourceIdFromExtendedAnnotation(selectedAnnotation);
    if (!isAssetAnnotation(selectedAnnotation) || resourceId === undefined) {
      return [];
    }

    const onAddThreeD = ({
      modelId,
      revisionId,
      initialAssetId,
    }: {
      modelId: number;
      revisionId: number;
      initialAssetId?: number;
    }) => {
      onAddContainerReferences([
        {
          type: ContainerReferenceType.THREE_D,
          id: `${modelId}-${revisionId}`,
          modelId,
          revisionId,
          initialAssetId,
        },
      ]);
    };

    const onAddTimeseries = (timeseriesId: number) => {
      onAddContainerReferences([
        {
          type: ContainerReferenceType.TIMESERIES,
          resourceId: timeseriesId,
          id: uuid(),
          startDate: dayjs(new Date())
            .subtract(2, 'years')
            .startOf('day')
            .toDate(),
          endDate: dayjs(new Date()).endOf('day').toDate(),
        },
      ]);
    };

    const onAddAsset = (): void => {
      onAddContainerReferences([
        {
          type: ContainerReferenceType.ASSET,
          id: `${resourceId}`,
          resourceId: resourceId,
        },
      ]);
    };

    const onViewAsset = (): void => {
      window.open(createLink(`/explore/asset/${resourceId}`), '_blank');
    };

    return [
      {
        targetId: String(selectedAnnotation?.id),
        content: (
          <AssetTooltip
            id={resourceId}
            onAddThreeD={onAddThreeD}
            onAddTimeseries={onAddTimeseries}
            onAddAsset={onAddAsset}
            onViewAsset={onViewAsset}
          />
        ),
        anchorTo: TooltipAnchorPosition.TOP_LEFT,
        shouldPositionStrictly: true,
      },
    ];
  }, [selectedAnnotation, onAddContainerReferences]);
};

export default useIndustryCanvasAssetTooltips;
