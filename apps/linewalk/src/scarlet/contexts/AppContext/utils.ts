import { v4 as uuid } from 'uuid';
import {
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
    dataElement.stateReason = stateReason?.trim();

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
  detection: Detection,
  value: string,
  externalSource: string | undefined,
  isApproved: boolean,
  isPrimary: boolean
): EquipmentData => {
  const { equipment, dataElement } = getCopy(
    equipmentOrigin,
    dataElementOrigin
  );
  dataElement.detections.push(detection);

  return updateDetection(
    equipment,
    dataElementOrigin,
    detection,
    value,
    externalSource,
    isApproved,
    isPrimary
  );
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

  if (detection.type === DetectionType.SCANNER) {
    dataElement.detections![detectionIndex!] = {
      ...detection,
      isModified: true,
      state: DetectionState.OMITTED,
      isPrimary: false,
    };
  } else {
    dataElement.detections.splice(detectionIndex, 1);
  }

  const isApproved = dataElement.detections.some((item) => item.isPrimary);

  dataElement.state = isApproved
    ? DataElementState.APPROVED
    : DataElementState.PENDING;

  return equipment;
};

export const updateDetection = (
  equipmentOrigin: EquipmentData,
  dataElementOrigin: DataElement,
  detectionOriginal: Detection,
  value: string,
  externalSource: string | undefined,
  isApproved: boolean,
  isPrimary: boolean
): EquipmentData => {
  const equipment: EquipmentData = deepCopy(equipmentOrigin);

  const dataElementList = getDataElementList(equipment, dataElementOrigin);

  const dataElementIndex = dataElementList.findIndex(
    (item) => item.key === dataElementOrigin.key
  );
  const dataElement = dataElementList[dataElementIndex];
  const detection = dataElement.detections!.find(
    (item) => item.id === detectionOriginal.id
  );

  if (!detection) return equipment;

  if (isPrimary) {
    dataElement.detections.forEach((detection, i) => {
      if (detection.isPrimary) {
        dataElement.detections[i].isPrimary = false;
      }
    });
  }

  detection.isModified = true;
  detection.value = value;
  detection.state = isApproved ? DetectionState.APPROVED : undefined;
  detection.isPrimary = isPrimary;

  if (externalSource !== undefined) {
    detection.externalSource = externalSource;
  }

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

export const setConnectedDataElements = (
  equipmentOrigin: EquipmentData,
  dataElementsOrigin: DataElement[],
  currentDataElementId: string,
  detection: Detection,
  isApproved: boolean,
  isPrimary: boolean
) => {
  const connectedId = detection.connectedId || uuid();
  let equipment = equipmentOrigin;
  dataElementsOrigin.forEach((dataElement) => {
    const itemDetection = dataElement.detections.find(
      (detection) => detection.connectedId === connectedId
    );
    if (itemDetection) {
      equipment = updateDetection(
        equipment,
        dataElement,
        itemDetection,
        detection.value!,
        detection.externalSource,
        isApproved,
        isPrimary
      );
    } else {
      let detectionType = detection.type;
      const isCurrentDataElement = dataElement.id === currentDataElementId;
      if (!isCurrentDataElement && detectionType === DetectionType.PCMS) {
        detectionType = DetectionType.MANUAL_INPUT;
      }

      equipment = addDetection(
        equipment,
        dataElement,
        {
          ...detection,
          id: isCurrentDataElement ? detection.id : uuid(),
          type: detectionType,
          connectedId,
          scannerComponent: isCurrentDataElement
            ? detection.scannerComponent
            : undefined,
        },
        detection.value!,
        detection.externalSource,
        isApproved,
        isPrimary
      );
    }
  });
  return equipment;
};
