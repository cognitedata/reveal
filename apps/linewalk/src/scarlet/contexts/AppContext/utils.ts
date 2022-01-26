import {
  DataElement,
  DataElementOrigin,
  DataElementState,
  Detection,
  DetectionState,
  EquipmentData,
} from 'scarlet/types';

const deepCopy = (obj: any) => JSON.parse(JSON.stringify(obj));

export const updateDataElementState = (
  equipmentOrigin: EquipmentData,
  dataElement: DataElement,
  state: DataElementState,
  stateReason?: string
): EquipmentData => {
  const equipment: EquipmentData = deepCopy(equipmentOrigin);
  if (dataElement.origin === DataElementOrigin.EQUIPMENT) {
    const index = equipment.equipmentElements.findIndex(
      (item) => item.key === dataElement.key
    );
    equipment.equipmentElements[index] = {
      ...dataElement,
      state,
      stateReason,
    };
  }
  return equipment;
};

export const removeDetection = (
  equipmentOrigin: EquipmentData,
  dataElementOrigin: DataElement,
  detection: Detection
): EquipmentData => {
  const equipment: EquipmentData = deepCopy(equipmentOrigin);
  const dataElement: DataElement = deepCopy(dataElementOrigin);

  if (dataElement.origin === DataElementOrigin.EQUIPMENT) {
    const dataElementIndex = equipment.equipmentElements.findIndex(
      (item) => item.key === dataElement.key
    );
    const detectionIndex = dataElement.detections!.findIndex(
      (item) => item.id === detection.id
    );
    dataElement.detections![detectionIndex!] = {
      ...detection,
      isModified: true,
      state: DetectionState.OMITTED,
    };
    equipment.equipmentElements[dataElementIndex] = dataElement;
  }
  return equipment;
};
