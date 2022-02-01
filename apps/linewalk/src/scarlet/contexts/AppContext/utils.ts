import { v4 as uuid } from 'uuid';
import {
  Annotation,
  DataElement,
  DataElementOrigin,
  DataElementState,
  Detection,
  DetectionState,
  DetectionType,
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

export const addDetection = (
  equipmentOrigin: EquipmentData,
  { origin, key }: DataElement,
  annotation: Annotation
): EquipmentData => {
  const equipment: EquipmentData = deepCopy(equipmentOrigin);

  if (origin === DataElementOrigin.EQUIPMENT) {
    const dataElement = equipment.equipmentElements.find(
      (item) => item.key === key
    );

    const detection: Detection = {
      id: uuid(),
      key,
      type: DetectionType.MANUAL,
      ...annotation,
    };

    dataElement?.detections.push(detection);
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

    dataElement.detections = dataElement.detections.filter(
      (detection) =>
        !(
          detection.state === DetectionState.OMITTED &&
          detection.type === DetectionType.MANUAL
        )
    );

    const isApproved = dataElement.detections.some(
      (item) => item.state === DetectionState.APPROVED
    );

    dataElement.state = isApproved
      ? DataElementState.APPROVED
      : DataElementState.PENDING;

    equipment.equipmentElements[dataElementIndex] = dataElement;
  }
  return equipment;
};

export const approveDetection = (
  equipmentOrigin: EquipmentData,
  { origin, key }: DataElement,
  detection: Detection,
  value: string
): EquipmentData => {
  const equipment: EquipmentData = deepCopy(equipmentOrigin);

  if (origin === DataElementOrigin.EQUIPMENT) {
    const dataElementIndex = equipment.equipmentElements.findIndex(
      (item) => item.key === key
    );
    const dataElement = equipment.equipmentElements[dataElementIndex];
    const detectionIndex = dataElement.detections!.findIndex(
      (item) => item.id === detection.id
    );

    dataElement.detections.forEach((detection, i) => {
      if (detection.state === DetectionState.APPROVED) {
        dataElement.detections[i].state = undefined;
      }
    });

    dataElement.detections![detectionIndex!] = {
      ...detection,
      isModified: true,
      state: DetectionState.APPROVED,
      value,
    };
    dataElement.state = DataElementState.APPROVED;
    dataElement.pcmsValue = value;
    equipment.equipmentElements[dataElementIndex] = dataElement;
  }
  return equipment;
};
