import { useCallback } from 'react';

import { DateRange } from '../containers/Filter';
import { ResourceItem } from '../types';

import { useNavigation } from './useNavigation';

export const useOpenIn = () => {
  const { toCanvas, toCharts } = useNavigation();

  const openInCanvas = useCallback(
    (resource?: ResourceItem) => {
      if (!resource?.id) {
        console.error("Can't open in canvas without an id");
        return;
      }

      toCanvas(resource);
    },
    [toCanvas]
  );

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

  return { openInCanvas, openInCharts };
};
