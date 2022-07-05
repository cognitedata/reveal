/* eslint-disable no-param-reassign */
import { v4 as uuid } from 'uuid';
import {
  BooleanDetectionValue,
  ComponentElementKey,
  DataElement,
  DataElementOrigin,
  DataElementState,
  DetectionState,
  DetectionType,
  EquipmentData,
  EquipmentElementKey,
  EquipmentType,
} from 'types';

import { getDataElementPCMSDetection } from '.';

export const preApproveDataElements = (
  equipment: EquipmentData,
  hasU1Document: boolean,
  unitId: string
): boolean => {
  let hasChanged = approveDataElements(
    equipment.equipmentElements,
    hasU1Document,
    unitId
  );

  if (equipment.type === EquipmentType.VESSEL) {
    equipment.components.forEach((component) => {
      hasChanged =
        approveDataElements(component.componentElements) || hasChanged;
    });
  }

  return hasChanged;
};

const approveDataElements = (
  dataElements: DataElement[],
  hasU1Document?: boolean,
  unitId?: string
): boolean => {
  let hasChanged = false;
  dataElements.forEach((dataElement) => {
    if (dataElement.state === DataElementState.OMITTED || dataElement.touched)
      return;
    const hasPrimaryDetection = dataElement.detections.some(
      (detection) => detection.isPrimary
    );

    if (hasPrimaryDetection) return;

    if (dataElement.origin === DataElementOrigin.EQUIPMENT) {
      hasChanged =
        approveEquipmentElement(dataElement, hasU1Document!, unitId!) ||
        hasChanged;
    } else {
      hasChanged = approveComponentElement(dataElement) || hasChanged;
    }
  });
  return hasChanged;
};

const approveEquipmentElement = (
  dataElement: DataElement,
  hasU1Document: boolean,
  unitId: string
): boolean => {
  switch (dataElement.key) {
    case EquipmentElementKey.ASSET_NO:
    case EquipmentElementKey.EQUIP_ID:
    case EquipmentElementKey.EQUIP_TYPE:
    case EquipmentElementKey.EQUIP_TYPE_DESCRIPTION:
      return approvePCMSDetection(dataElement);

    case EquipmentElementKey.CLASS:
      return setNotApplicableDetection(dataElement);

    case EquipmentElementKey.U1_ON_FILE_YN:
    case EquipmentElementKey.CODE_STAMP_YN:
      return approveAfterU1Document(dataElement, hasU1Document);

    case EquipmentElementKey.UNIT_ID:
      return approveUnitID(dataElement, unitId);

    case EquipmentElementKey.OPERATING_STATUS:
      return approveMALDetection(dataElement);

    case EquipmentElementKey.SYSTEM:
    case EquipmentElementKey.P_ID_DRAWING_NO:
    case EquipmentElementKey.OPERATING_PRESSURE:
    case EquipmentElementKey.OPERATING_TEMP:
      return approveMSDetection(dataElement);
  }
  return false;
};

const approveComponentElement = (dataElement: DataElement): boolean => {
  switch (dataElement.key) {
    case ComponentElementKey.COMPONENT_ID:
    case ComponentElementKey.DESCRIPTION:
    case ComponentElementKey.COMPONENT_MASTER:
    case ComponentElementKey.MAX_STRESS:
    case ComponentElementKey.OVERRIDE_MAX_STRESS_YN:
      return approvePCMSDetection(dataElement);

    case ComponentElementKey.SYS_GOVERN_CODE:
      return approveMALDetection(dataElement);

    case ComponentElementKey.P_ID_DRAWING_NO:
    case ComponentElementKey.INSTALL_DATE:
      return approveMSDetection(dataElement);
  }
  return false;
};

const approvePCMSDetection = (dataElement: DataElement): boolean => {
  const pcmsDetection = getDataElementPCMSDetection(dataElement);
  if (pcmsDetection) {
    pcmsDetection.state = DetectionState.APPROVED;
    pcmsDetection.isPrimary = true;
    dataElement.state = DataElementState.APPROVED;
    return true;
  }
  return false;
};

const setNotApplicableDetection = (dataElement: DataElement): boolean => {
  dataElement.detections.push({
    id: uuid(),
    type: DetectionType.MANUAL_INPUT,
    value: 'N/A',
    state: DetectionState.APPROVED,
    isPrimary: true,
  });
  dataElement.state = DataElementState.APPROVED;
  return true;
};

const approveAfterU1Document = (
  dataElement: DataElement,
  hasU1Document: boolean
): boolean => {
  if (hasU1Document) {
    const pcmsDetection = getDataElementPCMSDetection(dataElement);
    if (pcmsDetection && pcmsDetection.value === BooleanDetectionValue.YES) {
      pcmsDetection.state = DetectionState.APPROVED;
      pcmsDetection.isPrimary = true;
    } else {
      dataElement.detections.push({
        id: uuid(),
        type: DetectionType.MANUAL_INPUT,
        value: BooleanDetectionValue.YES,
        state: DetectionState.APPROVED,
        isPrimary: true,
      });
    }
    dataElement.state = DataElementState.APPROVED;
    return true;
  }
  return false;
};

const approveUnitID = (dataElement: DataElement, unitId: string): boolean => {
  const pcmsDetection = getDataElementPCMSDetection(dataElement);
  if (pcmsDetection && pcmsDetection.value === unitId) {
    pcmsDetection.state = DetectionState.APPROVED;
    pcmsDetection.isPrimary = true;
  } else {
    dataElement.detections.push({
      id: uuid(),
      type: DetectionType.MANUAL_INPUT,
      value: BooleanDetectionValue.YES,
      state: DetectionState.APPROVED,
      isPrimary: true,
    });
  }

  dataElement.state = DataElementState.APPROVED;
  return true;
};

const approveMALDetection = (dataElement: DataElement): boolean => {
  const malDetection = dataElement.detections.find(
    (detection) => detection.type === DetectionType.MAL
  );

  if (malDetection) {
    malDetection.state = DetectionState.APPROVED;
    malDetection.isPrimary = true;
    dataElement.state = DataElementState.APPROVED;
    return true;
  }
  return false;
};

const approveMSDetection = (dataElement: DataElement): boolean => {
  const msDetection = dataElement.detections.find((detection) =>
    [DetectionType.MS2, DetectionType.MS3].includes(detection.type)
  );

  if (msDetection) {
    msDetection.state = DetectionState.APPROVED;
    msDetection.isPrimary = true;
    dataElement.state = DataElementState.APPROVED;
    return true;
  }
  return false;
};
