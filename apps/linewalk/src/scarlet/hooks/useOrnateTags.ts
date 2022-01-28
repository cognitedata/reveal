import { useMemo } from 'react';
import { DataElementState, DetectionState, OrnateTag } from 'scarlet/types';

import { useAppState, useDataPanelState } from '.';

export const useOrnateTags = (): OrnateTag[] => {
  const { equipment } = useAppState();
  const { visibleDataElement } = useDataPanelState();

  const dataElements = useMemo(
    () =>
      equipment.data?.equipmentElements.filter(
        (item) =>
          item.state !== DataElementState.OMITTED &&
          item.detections?.length &&
          (!visibleDataElement || item.key === visibleDataElement.key)
      ),
    [equipment.data, visibleDataElement]
  );

  const tags: OrnateTag[] = useMemo(() => {
    const result: OrnateTag[] = [];

    dataElements?.forEach((dataElement) => {
      dataElement.detections
        ?.filter(
          (detection) =>
            detection.boundingBox &&
            detection.documentExternalId &&
            detection.state !== DetectionState.OMITTED
        )
        .forEach((detection) => {
          if (
            !visibleDataElement &&
            dataElement.state === DataElementState.APPROVED &&
            detection.state !== DetectionState.APPROVED
          ) {
            return;
          }

          result.push({
            id: detection.id + detection.state,
            detection,
            dataElement,
          });
        });
    });

    return result;
  }, [dataElements]);

  return tags;
};
