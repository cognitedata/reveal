import { useMemo } from 'react';

import dayjs from 'dayjs';

import { createLink } from '@cognite/cdf-utilities';
import {
  getResourceIdFromExtendedAnnotation,
  isAssetAnnotation,
} from '@cognite/data-exploration';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

import AssetTooltip from '../components/ContextualTooltips/AssetTooltip';
import { ANNOTATION_TOOLTIP_POSITION, MetricEvent } from '../constants';
import { OnAddContainerReferences } from '../IndustryCanvasPage';
import { ContainerReferenceType } from '../types';
import useMetrics from '../utils/tracking/useMetrics';

import { UseManagedStateReturnType } from './useManagedState';
import { UseResourceSelectorActionsReturnType } from './useResourceSelectorActions';

const useIndustryCanvasAssetTooltips = (
  selectedAnnotation: ExtendedAnnotation | undefined,
  onAddContainerReferences: OnAddContainerReferences,
  onResourceSelectorOpen: UseResourceSelectorActionsReturnType['onResourceSelectorOpen'],
  pinnedTimeseriesIdsByAnnotationId: UseManagedStateReturnType['pinnedTimeseriesIdsByAnnotationId'],
  onPinTimeseriesClick: UseManagedStateReturnType['onPinTimeseriesClick'],
  onOpenConditionalFormattingClick: UseManagedStateReturnType['onOpenConditionalFormattingClick']
) => {
  const trackUsage = useMetrics();

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
      trackUsage(MetricEvent.ASSET_TOOLTIP_ADD_THREE_D);
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
      trackUsage(MetricEvent.ASSET_TOOLTIP_ADD_TIMESERIES);
    };

    const onAddAsset = (): void => {
      onAddContainerReferences([
        {
          type: ContainerReferenceType.ASSET,
          resourceId: resourceId,
        },
      ]);
      trackUsage(MetricEvent.ASSET_TOOLTIP_ADD_ASSET);
    };

    const onViewAsset = (): void => {
      window.open(createLink(`/explore/asset/${resourceId}`), '_blank');
      trackUsage(MetricEvent.ASSET_TOOLTIP_OPEN_IN_DATA_EXPLORER);
    };

    const onOpenAssetInResourceSelector = (): void => {
      trackUsage(MetricEvent.ASSET_TOOLTIP_OPEN_IN_RESOURCE_SELECTOR, {
        containerType: 'file',
        resourceType: 'asset',
      });
      onResourceSelectorOpen({
        initialSelectedResourceItem: {
          type: 'asset',
          id: resourceId,
        },
        initialFilter: {
          common: {
            internalId: resourceId,
          },
        },
        shouldOnlyShowPreviewPane: true,
      });
    };

    const onOpenTimeseriesTabInResourceSelector = (): void => {
      trackUsage(
        MetricEvent.ASSET_TOOLTIP_OPEN_TIMESERIES_TAB_IN_RESOURCE_SELECTOR,
        {
          containerType: 'file',
          resourceType: 'timeseries',
        }
      );
      onResourceSelectorOpen({
        initialFilter: {
          common: {
            assetSubtreeIds: [{ value: resourceId }],
          },
        },
        initialTab: 'timeSeries',
      });
    };

    const hasPinnedTimeseries =
      (pinnedTimeseriesIdsByAnnotationId[selectedAnnotation.id] ?? []).length >
      0;

    const onSetConditionalFormattingClick = hasPinnedTimeseries
      ? () => {
          onOpenConditionalFormattingClick({
            annotationId: selectedAnnotation.id,
            timeseriesId:
              pinnedTimeseriesIdsByAnnotationId[selectedAnnotation.id][0],
          });
        }
      : undefined;

    return [
      {
        targetId: String(selectedAnnotation?.id),
        content: (
          <AssetTooltip
            id={resourceId}
            pinnedTimeseriesIds={
              pinnedTimeseriesIdsByAnnotationId[selectedAnnotation.id] ?? []
            }
            onPinTimeseriesClick={(timeseriesId) =>
              onPinTimeseriesClick({
                annotationId: selectedAnnotation.id,
                timeseriesId,
              })
            }
            onAddThreeD={onAddThreeD}
            onAddTimeseries={onAddTimeseries}
            onAddAsset={onAddAsset}
            onViewAsset={onViewAsset}
            onOpenAssetInResourceSelector={onOpenAssetInResourceSelector}
            onOpenTimeseriesTabInResourceSelector={
              onOpenTimeseriesTabInResourceSelector
            }
            onSetConditionalFormattingClick={onSetConditionalFormattingClick}
          />
        ),
        anchorTo: ANNOTATION_TOOLTIP_POSITION,
        shouldPositionStrictly: true,
      },
    ];
  }, [
    pinnedTimeseriesIdsByAnnotationId,
    onPinTimeseriesClick,
    selectedAnnotation,
    onAddContainerReferences,
    trackUsage,
    onResourceSelectorOpen,
  ]);
};

export default useIndustryCanvasAssetTooltips;
