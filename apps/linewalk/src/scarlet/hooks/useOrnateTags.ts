import { useMemo } from 'react';
import { DataElementState, DetectionState, OrnateTag } from 'scarlet/types';

import { useAppState, useDataPanelState } from '.';

export const useOrnateTags = (): {
  tags: OrnateTag[];
  activeTag?: OrnateTag;
} => {
  const { equipment } = useAppState();
  const { visibleDataElement, activeDetection } = useDataPanelState();

  const dataElements = useMemo(
    () =>
      [
        ...(equipment.data?.equipmentElements || []),
        ...(equipment.data?.components
          .filter(
            (component) =>
              !visibleDataElement ||
              visibleDataElement?.componentId === component.id
          )
          .map((component) => component.componentElements) || []),
      ]
        .flat()
        .filter(
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
          // -TODO: enable later, should be off now for demo purpose
          // if (
          //   !visibleDataElement &&
          //   dataElement.state === DataElementState.APPROVED &&
          //   detection.state !== DetectionState.APPROVED
          // ) {
          //   return;
          // }

          result.push({
            id: detection.id + detection.state,
            detection,
            dataElement,
          });
        });
    });

    return result;
  }, [dataElements]);

  const activeTag = useMemo(() => {
    if (!activeDetection) return undefined;
    const tag = tags.find((tag) => tag.detection.id === activeDetection.id);
    return tag && (JSON.parse(JSON.stringify(tag)) as OrnateTag);
  }, [tags, activeDetection]);

  return { tags, activeTag };
};
