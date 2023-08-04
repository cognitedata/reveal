import { useCallback } from 'react';

import { resourceItemToContainerReference } from '@fusion/industry-canvas';

import { DateRange } from '../containers/Filter';
import { ResourceItem } from '../types';

import { useNavigation } from './useNavigation';

export const useOpenIn = () => {
  const { toCanvas, toCharts } = useNavigation();

  const openInCharts = useCallback(
    (id?: number, dateRange?: DateRange) => {
      if (!id) {
        console.error("Can't open in charts without an id");
        return;
      }

      toCharts(id, dateRange);
    },
    [toCharts]
  );

  const openAssetCentricResourceItemInCanvas = useCallback(
    (item: ResourceItem) => {
      if (!item?.id) {
        console.error("Can't open resource in canvas without an id");
        return;
      }
      toCanvas(
        resourceItemToContainerReference({ id: item.id, type: item.type })
      );
    },
    [toCanvas]
  );

  return {
    openContainerReferenceInCanvas: toCanvas,
    openAssetCentricResourceItemInCanvas,
    openInCharts,
  };
};
