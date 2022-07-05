import { v4 as uuid } from 'uuid';
import {
  AppState,
  DataElement,
  DataElementOrigin,
  DataElementState,
  Detection,
  DetectionState,
  DetectionType,
  EquipmentComponent,
  EquipmentData,
  Remark,
} from 'types';
import {
  findU1Document,
  preApproveDataElements,
  updateCalculatedDataElements,
} from 'utils';

const deepCopy = (obj: any) => JSON.parse(JSON.stringify(obj));

export const initEquipment = (
  state: AppState,
  equipmentOrigin: EquipmentData
): { data: EquipmentData; isChanged: boolean } => {
  const equipment = deepCopy(equipmentOrigin);
  const hasU1Document = Boolean(findU1Document(state.documents.data));

  let isChanged = false;
  if (equipment) {
    isChanged = preApproveDataElements(equipment, hasU1Document, state.unitId);
    isChanged = updateCalculatedDataElements(equipment) || isChanged;
  }

  return {
    data: equipment,
    isChanged,
  };
};

export const updateDataElementState = (
  equipmentOrigin: EquipmentData,
  dataElementsOrigin: DataElement[],
  state: DataElementState,
  stateReason?: string
): EquipmentData => {
  let equipment: EquipmentData = deepCopy(equipmentOrigin);

  dataElementsOrigin.forEach((dataElementOrigin) => {
    const dataElementList = getDataElementList(equipment, dataElementOrigin);
    const dataElement = dataElementList.find(
      (item) => item.key === dataElementOrigin.key
    );
    if (!dataElement) return;

    setDataElementState(dataElement, state, stateReason);

    if (state === DataElementState.OMITTED) {
      dataElement.detections.forEach((detection) => {
        // eslint-disable-next-line no-param-reassign
        detection.isPrimary = false;
      });
      updateCalculatedDataElements(equipment);
    }
  });

  equipment = removeLinkedDetectionsWithoutOrigin(equipment);

  return equipment;
};

export const replaceDetection = (
  equipmentOrigin: EquipmentData,
  dataElementOrigin: DataElement,
  detectionOrigin: Detection
): EquipmentData => {
  let equipment: EquipmentData = deepCopy(equipmentOrigin);
  const detection = deepCopy(detectionOrigin);

  if (!detection.isPrimary) {
    equipment = removeLinkedDetections(equipment, detection.id);
  } else {
    updateLinkedDetections(equipment, detectionOrigin);
  }

  const dataElement = getDataElement(equipment, dataElementOrigin);

  if (detection.isPrimary) {
    dataElement.detections = dataElement.detections
      .filter(
        (itemDetection) =>
          itemDetection.type !== DetectionType.LINKED ||
          detection.id === itemDetection.id
      )
      .map((itemDetection) => ({
        ...itemDetection,
        isPrimary: false,
      }));
  }

  const detectionIndex = dataElement.detections!.findIndex(
    (item) => item.id === detection.id
  );

  if (detectionIndex === -1) {
    dataElement.detections.push(detection);
  } else {
    dataElement.detections[detectionIndex] = detection;
  }

  const state = dataElement.detections.some((detection) => detection.isPrimary)
    ? DataElementState.APPROVED
    : DataElementState.PENDING;

  setDataElementState(dataElement, state);

  updateComponentScannerDetectionsOnApproval(equipment, dataElement);
  updateCalculatedDataElements(equipment);

  return equipment;
};

export const removeDetection = (
  equipmentOrigin: EquipmentData,
  dataElementOrigin: DataElement,
  detection: Detection
): EquipmentData => {
  const equipment = removeLinkedDetections(equipmentOrigin, detection.id);
  const dataElement = getDataElement(equipment, dataElementOrigin);

  const detectionIndex = dataElement.detections!.findIndex(
    (item) => item.id === detection.id
  );

  if (
    [
      DetectionType.SCANNER,
      DetectionType.MAL,
      DetectionType.MS2,
      DetectionType.MS3,
    ].includes(detection.type)
  ) {
    dataElement.detections![detectionIndex!] = {
      ...detection,
      state: DetectionState.OMITTED,
      isPrimary: false,
    };
  } else {
    dataElement.detections.splice(detectionIndex, 1);
  }

  const hasPrimaryDetection = dataElement.detections.some(
    (item) => item.isPrimary
  );

  const state = hasPrimaryDetection
    ? DataElementState.APPROVED
    : DataElementState.PENDING;

  setDataElementState(dataElement, state);
  updateCalculatedDataElements(equipment);

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
  let equipment: EquipmentData = deepCopy(equipmentOrigin);
  equipment.components = equipment.components.filter(
    (c) => !componentIds.includes(c.id)
  );
  equipment = removeLinkedDetectionsWithoutOrigin(equipment);
  updateCalculatedDataElements(equipment);
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

const getDataElement = (
  equipment: EquipmentData,
  dataElementOrigin: DataElement
): DataElement => {
  const dataElementList = getDataElementList(equipment, dataElementOrigin);

  const dataElement = dataElementList.find(
    (item) => item.key === dataElementOrigin.key
  );

  return dataElement!;
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
    (d) =>
      d.state === DetectionState.APPROVED && d.type === DetectionType.SCANNER
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

export const setLinkedDetections = (
  equipmentOrigin: EquipmentData,
  detection: Detection,
  dataElements: DataElement[]
): EquipmentData => {
  const equipment = removeLinkedDetections(equipmentOrigin, detection.id);

  return dataElements.reduce(
    (equipment, dataElement) =>
      replaceDetection(equipment, dataElement, {
        id: uuid(),
        type: DetectionType.LINKED,
        detectionOriginId: detection.id,
        state: DetectionState.APPROVED,
        value: detection.value!,
        externalSource: detection.externalSource,
        isPrimary: true,
      }),
    equipment
  );
};

const removeLinkedDetections = (
  equipmentOrigin: EquipmentData,
  detectionOriginId: string,
  ignoreDetectionIds: string[] = []
): EquipmentData =>
  [
    ...equipmentOrigin.equipmentElements,
    ...equipmentOrigin.components.flatMap((c) => c.componentElements),
  ].reduce((equipment, equipmentElement) => {
    const detectionToDelete = equipmentElement.detections.find(
      (d) => d.detectionOriginId === detectionOriginId
    );

    if (
      detectionToDelete &&
      !ignoreDetectionIds.includes(detectionToDelete.id)
    ) {
      return removeDetection(equipment, equipmentElement, detectionToDelete);
    }
    return equipment;
  }, deepCopy(equipmentOrigin) as EquipmentData);

const removeLinkedDetectionsWithoutOrigin = (
  equipmentOrigin: EquipmentData
): EquipmentData => {
  let equipment: EquipmentData = deepCopy(equipmentOrigin);

  const allDataElements = [
    ...equipment.equipmentElements,
    ...equipment.components.flatMap((component) => component.componentElements),
  ].filter((dataElement) => dataElement.state !== DataElementState.OMITTED);

  const activeDetectionIds = allDataElements
    .flatMap((dataElement) => dataElement.detections)
    .filter(
      (detection) =>
        detection.state === DetectionState.APPROVED && detection.isPrimary
    )
    .map((detection) => detection.id);

  allDataElements.forEach((dataElement) => {
    dataElement.detections
      .filter(
        (detection) =>
          detection.type === DetectionType.LINKED &&
          detection.detectionOriginId &&
          !activeDetectionIds.includes(detection.detectionOriginId!)
      )
      .forEach((detection) => {
        equipment = removeDetection(equipment, dataElement, detection);
      });
  });

  return equipment;
};

const updateLinkedDetections = (
  equipment: EquipmentData,
  detectionOrigin: Detection
) => {
  [
    ...equipment.equipmentElements,
    ...equipment.components.flatMap((component) => component.componentElements),
  ]
    .flatMap((dataElement) => dataElement.detections)
    .filter(
      (detection) =>
        detection.type === DetectionType.LINKED &&
        detection.detectionOriginId === detectionOrigin.id
    )
    .forEach((detection) => {
      /* eslint-disable no-param-reassign */
      detection.value = detectionOrigin.value;
      detection.externalSource = detectionOrigin.externalSource;
      /* eslint-enable no-param-reassign */
    });
};

const setDataElementState = (
  dataElement: DataElement,
  state: DataElementState,
  stateReason?: string
) => {
  /* eslint-disable no-param-reassign */
  dataElement.state = state;
  dataElement.stateReason = stateReason?.trim();
  dataElement.touched = true;
  /* eslint-enable no-param-reassign */
};

// const updateCalculatedDataElements = (equipment: EquipmentData): boolean => {
//   const hasChanged = false;
//   equipment.equipmentElements.forEach

//   return false;
// };
