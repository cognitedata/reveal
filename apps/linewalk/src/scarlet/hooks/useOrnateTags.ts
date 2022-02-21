import { useMemo } from 'react';
import { v5 as uuid } from 'uuid';
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
          const isActive =
            (activeDetection && activeDetection.id === detection.id) || false;

          const id = uuid(
            detection.id + detection.state + detection.value + isActive,
            '00000000-0000-0000-0000-000000000000'
          );

          result.push({
            id,
            detection,
            dataElement,
            isActive,
          });
        });
    });

    return result;
  }, [dataElements, activeDetection]);

  const activeTag = useMemo(() => {
    const tag = tags.find((tag) => tag.isActive);
    return tag && (JSON.parse(JSON.stringify(tag)) as OrnateTag);
  }, [tags, activeDetection]);

  return { tags, activeTag };
};
