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
  Remark,
} from 'scarlet/types';

const deepCopy = (obj: any) => JSON.parse(JSON.stringify(obj));

export const updateDataElementState = (
  equipmentOrigin: EquipmentData,
  dataElementsOrigin: DataElement[],
  state: DataElementState,
  stateReason?: string
): EquipmentData => {
  const equipment: EquipmentData = deepCopy(equipmentOrigin);

  dataElementsOrigin.forEach((dataElementOrigin) => {
    const dataElementList = getDataElementList(equipment, dataElementOrigin);
    const dataElement = dataElementList.find(
      (item) => item.key === dataElementOrigin.key
    );
    if (!dataElement) return;

    dataElement.state = state;
    dataElement.stateReason = stateReason;

    if (state === DataElementState.OMITTED) {
      dataElement.detections.forEach((detection) => {
        // eslint-disable-next-line no-param-reassign
        detection.isPrimary = false;
      });
    }
  });

  return equipment;
};

export const addDetection = (
  equipmentOrigin: EquipmentData,
  dataElementOrigin: DataElement,
  annotation: Annotation
): EquipmentData => {
  const { equipment, dataElement } = getCopy(
    equipmentOrigin,
    dataElementOrigin
  );

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
  const { equipment, dataElement } = getCopy(
    equipmentOrigin,
    dataElementOrigin
  );

  const detectionIndex = dataElement.detections!.findIndex(
    (item) => item.id === detection.id
  );
  dataElement.detections![detectionIndex!] = {
    ...detection,
    isModified: true,
    state: DetectionState.OMITTED,
    isPrimary: false,
  };

  dataElement.detections = dataElement.detections.filter(
    (detection) =>
      !(
        detection.state === DetectionState.OMITTED &&
        detection.type === DetectionType.MANUAL
      )
  );

  const isApproved = dataElement.detections.some((item) => item.isPrimary);

  dataElement.state = isApproved
    ? DataElementState.APPROVED
    : DataElementState.PENDING;

  return equipment;
};

export const updateDetection = (
  equipmentOrigin: EquipmentData,
  dataElementOrigin: DataElement,
  detection: Detection,
  value: string,
  isApproved: boolean,
  isPrimary: boolean
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

  if (isPrimary) {
    dataElement.detections.forEach((detection, i) => {
      if (detection.isPrimary) {
        dataElement.detections[i].isPrimary = false;
      }
    });
  }

  dataElement.detections![detectionIndex!] = {
    ...detection,
    isModified: true,
    value,
    state: isApproved ? DetectionState.APPROVED : undefined,
    isPrimary,
  };
  dataElement.state = dataElement.detections.some(
    (detection) => detection.isPrimary
  )
    ? DataElementState.APPROVED
    : DataElementState.PENDING;
  dataElementList[dataElementIndex] = dataElement;
  updateComponentScannerDetectionsOnApproval(equipment, dataElement);

  return equipment;
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

export const updateComponents = (
  equipmentOrigin: EquipmentData,
  componentsWithUpdates: Partial<EquipmentComponent>[]
) => {
  const equipment: EquipmentData = deepCopy(equipmentOrigin);
  equipment.components = equipment.components.map((component) => {
    const update = componentsWithUpdates.find(
      (item) => item.id === component.id
    );
    return !update
      ? component
      : {
          ...component,
          ...update,
        };
  });
  return equipment;
};

export const addRemark = (
  equipmentOrigin: EquipmentData,
  dataElementOrigin: DataElement,
  remark: Remark
): EquipmentData => {
  const { equipment, dataElement } = getCopy(
    equipmentOrigin,
    dataElementOrigin
  );

  if (!dataElement.remarks?.length) dataElement.remarks = [];
  dataElement.remarks.push(remark);

  return equipment;
};

export const approveEquipment = (equipmentOrigin: EquipmentData) => {
  const equipment = deepCopy(equipmentOrigin);
  equipment.isApproved = true;

  return equipment;
};

const getCopy = (
  equipmentOrigin: EquipmentData,
  dataElementOrigin: DataElement
): { equipment: EquipmentData; dataElement: DataElement } => {
  const equipment: EquipmentData = deepCopy(equipmentOrigin);
  const dataElementList = getDataElementList(equipment, dataElementOrigin);

  const dataElement = dataElementList.find(
    (item) => item.key === dataElementOrigin.key
  );

  return { equipment, dataElement: dataElement! };
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
