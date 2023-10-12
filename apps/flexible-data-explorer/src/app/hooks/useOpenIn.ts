import { useCallback } from 'react';

import { DateRange } from '../containers/Filter';
import {
  ContainerReference,
  FdmInstanceContainerReference,
  ResourceItem,
} from '../types';
import { resourceItemToContainerReference } from '../utils/canvas';

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

  const openContainerReferenceInCanvas = useCallback(
    (container: Partial<FdmInstanceContainerReference>) => {
      if (
        container?.viewExternalId === undefined ||
        container?.instanceExternalId === undefined ||
        container?.instanceSpace === undefined ||
        container?.viewSpace === undefined ||
        container?.type === undefined
      ) {
        console.error("Can't open container in canvas without all fields");
        return;
      }

      toCanvas(container as ContainerReference);
    },
    [toCanvas]
  );

  return {
    openContainerReferenceInCanvas,
    openAssetCentricResourceItemInCanvas,
    openInCharts,
  };
};
