import { useMemo } from 'react';

import dayjs from 'dayjs';

import { createLink } from '@cognite/cdf-utilities';
import {
  getResourceIdFromExtendedAnnotation,
  isAssetAnnotation,
} from '@cognite/data-exploration';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

import AssetTooltip from '../components/ContextualTooltips/AssetTooltip';
import { ANNOTATION_TOOLTIP_POSITION } from '../constants';
import { OnAddContainerReferences } from '../IndustryCanvasPage';
import { ContainerReferenceType } from '../types';

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
          startDate: dayjs(new Date())
            .subtract(2, 'years')
            .startOf('day')
            .toISOString(),
          endDate: dayjs(new Date()).endOf('day').toISOString(),
        },
      ]);
    };

    const onAddAsset = (): void => {
      onAddContainerReferences([
        {
          type: ContainerReferenceType.ASSET,
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
        anchorTo: ANNOTATION_TOOLTIP_POSITION,
        shouldPositionStrictly: true,
      },
    ];
  }, [selectedAnnotation, onAddContainerReferences]);
};

export default useIndustryCanvasAssetTooltips;
