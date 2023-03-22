import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';
import {
  getResourceIdFromExtendedAnnotation,
  isAssetAnnotation,
} from '@cognite/data-exploration';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import dayjs from 'dayjs';

import { useMemo } from 'react';
import AssetTooltip from '../components/AssetTooltip';
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

    const onAddTimeseries = (timeseriesId: number) => {
      onAddContainerReferences([
        {
          type: ContainerReferenceType.TIMESERIES,
          id: timeseriesId,
          startDate: dayjs(new Date())
            .subtract(6, 'months')
            .startOf('day')
            .toDate(),
          endDate: dayjs(new Date()).endOf('day').toDate(),
        },
      ]);
    };

    return [
      {
        targetId: String(selectedAnnotation?.id),
        content: (
          <AssetTooltip
            id={resourceId}
            onAddTimeseries={onAddTimeseries}
            onAddAsset={() => {
              // To be implemented
              return undefined;
            }}
            onViewAsset={() => {
              // To be implemented
              return undefined;
            }}
          />
        ),
        anchorTo: TooltipAnchorPosition.TOP_LEFT,
        shouldPositionStrictly: true,
      },
    ];
  }, [selectedAnnotation]);
};

export default useIndustryCanvasAssetTooltips;
