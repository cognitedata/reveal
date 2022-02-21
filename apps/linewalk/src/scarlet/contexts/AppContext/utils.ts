import { v4 as uuid } from 'uuid';
import {
  Annotation,
  DataElement,
  DataElementOrigin,
  DataElementState,
  Detection,
  DetectionState,
  DetectionType,
  EquipmentComponent,
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
  const dataElementList = getDataElementList(equipment, dataElement);

  const index = dataElementList.findIndex(
    (item) => item.key === dataElement.key
  );
  dataElementList[index] = {
    ...dataElement,
    state,
    stateReason,
  };
  return equipment;
};

export const addDetection = (
  equipmentOrigin: EquipmentData,
  dataElementOrigin: DataElement,
  annotation: Annotation
): EquipmentData => {
  const equipment: EquipmentData = deepCopy(equipmentOrigin);

  const dataElementList = getDataElementList(equipment, dataElementOrigin);

  const dataElement = dataElementList.find(
    (item) => item.key === dataElementOrigin.key
  )!;

  const detection: Detection = {
    id: uuid(),
    key: dataElement.key,
    type: DetectionType.MANUAL,
    ...annotation,
  };

  dataElement.detections.push(detection);
  return equipment;
};

export const removeDetection = (
  equipmentOrigin: EquipmentData,
  dataElementOrigin: DataElement,
  detection: Detection
): EquipmentData => {
  const equipment: EquipmentData = deepCopy(equipmentOrigin);
  const dataElement: DataElement = deepCopy(dataElementOrigin);
  const dataElementList = getDataElementList(equipment, dataElementOrigin);

  const dataElementIndex = dataElementList.findIndex(
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

  dataElementList[dataElementIndex] = dataElement;

  return equipment;
};

export const approveDetection = (
  equipmentOrigin: EquipmentData,
  dataElementOrigin: DataElement,
  detection: Detection,
  isApproved: boolean
): EquipmentData => {
  const equipment: EquipmentData = deepCopy(equipmentOrigin);

  const dataElementList = getDataElementList(equipment, dataElementOrigin);

  const dataElementIndex = dataElementList.findIndex(
    (item) => item.key === dataElementOrigin.key
  );
  const dataElement = dataElementList[dataElementIndex];
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
    state: isApproved ? DetectionState.APPROVED : undefined,
  };
  dataElement.state = isApproved
    ? DataElementState.APPROVED
    : DataElementState.PENDING;
  dataElementList[dataElementIndex] = dataElement;
  updateComponentScannerDetectionsOnApproval(equipment, dataElement);

  return equipment;
};

export const saveDetection = (
  equipmentOrigin: EquipmentData,
  dataElementOrigin: DataElement,
  originalDetection: Detection,
  value: string
): EquipmentData => {
  const equipment: EquipmentData = deepCopy(equipmentOrigin);

  const dataElementList = getDataElementList(equipment, dataElementOrigin);

  const dataElement = dataElementList.find(
    (item) => item.key === dataElementOrigin.key
  );
  const detection: Detection = dataElement!.detections!.find(
    (item) => item.id === originalDetection.id
  )!;

  detection.value = value;
  const isApproved = detection.state === DetectionState.APPROVED;
  if (isApproved) {
    detection.state = undefined;
    dataElement!.state = DataElementState.PENDING;
  }

  return equipment;
};

const getDataElementList = (
  equipment: EquipmentData,
  dataElement: DataElement
) =>
  dataElement.origin === DataElementOrigin.EQUIPMENT
    ? equipment.equipmentElements
    : equipment.components.find(
        (component) => component.id === dataElement.componentId
      )?.componentElements || [];

const updateComponentScannerDetectionsOnApproval = (
  equipment: EquipmentData,
  dataElement: DataElement
) => {
  if (dataElement.origin !== DataElementOrigin.COMPONENT) return;
  const approveDetection = dataElement.detections.find(
    (d) => d.state === DetectionState.APPROVED
  );
  const approveDetectionScannerId = approveDetection?.scannerComponent?.id;
  if (approveDetectionScannerId) {
    equipment.components.forEach((component) => {
      component?.componentElements.forEach((dataElementItem) => {
        // eslint-disable-next-line no-param-reassign
        dataElementItem.detections = dataElementItem.detections.filter(
          (detection) =>
            !detection.scannerComponent?.id ||
            (component.id === dataElement.componentId &&
              detection.scannerComponent.id === approveDetectionScannerId) ||
            (component.id !== dataElement.componentId &&
              detection.scannerComponent.id !== approveDetectionScannerId)
        );
      });
    });
  }
};

export const addComponent = (
  equipmentOrigin: EquipmentData,
  component: EquipmentComponent
) => {
  const equipment: EquipmentData = deepCopy(equipmentOrigin);
  equipment.components.push(component);
  return equipment;
};

export const deleteComponents = (
  equipmentOrigin: EquipmentData,
  componentIds: string[]
) => {
  const equipment: EquipmentData = deepCopy(equipmentOrigin);
  equipment.components = equipment.components.filter(
    (c) => !componentIds.includes(c.id)
  );
  return equipment;
};
