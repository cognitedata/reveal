import { useMemo } from 'react';
import { v5 as uuid } from 'uuid';
import {
  DataElement,
  DataElementState,
  Detection,
  DetectionState,
  OrnateTag,
} from 'scarlet/types';

import { useAppState, useDataPanelState } from '.';

export const useOrnateTags = (): {
  tags: OrnateTag[];
  activeTag?: OrnateTag;
} => {
  const { equipment } = useAppState();
  const { visibleDataElement, newDetection, activeDetection } =
    useDataPanelState();

  const dataElements = useMemo(
    () =>
      [
        ...(equipment.data?.equipmentElements || []),
        ...(equipment.data?.components.map(
          (component) => component.componentElements
        ) || []),
      ]
        .flat()
        .filter((item) => {
          // filter by state and amount of detections
          if (
            item.state === DataElementState.OMITTED &&
            !item.detections?.length
          ) {
            return false;
          }

          return true;
        }),
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
          const tag = getOrnateTag({ detection, dataElement, activeDetection });
          result.push(tag);
        });
    });

    if (newDetection && visibleDataElement) {
      const tag = getOrnateTag({
        detection: newDetection,
        dataElement: visibleDataElement,
        activeDetection,
      });
      result.push(tag);
    }

    return result;
  }, [dataElements, activeDetection, newDetection]);

  const activeTag = useMemo(() => {
    const tag = tags.find((tag) => tag.isActive);
    return tag && (JSON.parse(JSON.stringify(tag)) as OrnateTag);
  }, [tags, activeDetection]);

  return { tags, activeTag };
};

const getOrnateTag = ({
  detection,
  dataElement,
  activeDetection,
}: {
  detection: Detection;
  dataElement: DataElement;
  activeDetection?: Detection;
}): OrnateTag => {
  const isActive =
    (activeDetection && activeDetection.id === detection.id) || false;

  const id = uuid(
    detection.id + detection.state + detection.value + isActive,
    '00000000-0000-0000-0000-000000000000'
  );

  return {
    id,
    detection,
    dataElement,
    isActive,
  };
};
