import { useMemo } from 'react';
import {
  DataElement,
  Detection,
  DetectionType,
  EquipmentComponent,
} from 'types';

import { useAppState } from '.';

export const useDetectionOrigin = (detection: Detection) => {
  const appState = useAppState();

  return useMemo(() => {
    let detectionOrigin: Detection | undefined;
    let dataElementOrigin: DataElement | undefined;
    let componentOrigin: EquipmentComponent | undefined;

    if (detection.type !== DetectionType.LINKED || !detection.detectionOriginId)
      return { detectionOrigin, dataElementOrigin, componentOrigin };

    const { detectionOriginId } = detection;

    dataElementOrigin = appState.equipment.data!.equipmentElements.find(
      (dataElement) => {
        detectionOrigin = dataElement.detections.find(
          (detection) => detection.id === detectionOriginId
        );
        return detectionOrigin;
      }
    );

    if (!dataElementOrigin) {
      componentOrigin = appState.equipment.data!.components.find(
        (component) => {
          dataElementOrigin = component.componentElements.find(
            (dataElement) => {
              detectionOrigin = dataElement.detections.find(
                (detection) => detection.id === detectionOriginId
              );
              return detectionOrigin;
            }
          );
          return dataElementOrigin;
        }
      );
    }

    return { componentOrigin, dataElementOrigin, detectionOrigin };
  }, [detection, appState.equipment]);
};
