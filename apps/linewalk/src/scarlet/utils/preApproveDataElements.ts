/* eslint-disable no-param-reassign */
import { v4 as uuid } from 'uuid';
import {
  BooleanDetectionValue,
  DataElement,
  DataElementState,
  DetectionState,
  DetectionType,
  EquipmentData,
  EquipmentElementKey,
} from 'scarlet/types';

import { getDataElementPCMSDetection } from '.';

export const preApproveDataElements = (
  equipment: EquipmentData,
  hasU1Document: boolean,
  unitId: string
): boolean => {
  return preApproveEquipmentElements(
    equipment.equipmentElements,
    hasU1Document,
    unitId
  );
};

const preApproveEquipmentElements = (
  dataElements: DataElement[],
  hasU1Document: boolean,
  unitId: string
): boolean => {
  let hasChanged = false;
  dataElements.forEach((dataElement) => {
    if (dataElement.state === DataElementState.OMITTED) return;
    const hasPrimaryDetection = dataElement.detections.some(
      (detection) => detection.isPrimary
    );

    if (hasPrimaryDetection) return;

    switch (dataElement.key) {
      case EquipmentElementKey.ASSET_NO:
      case EquipmentElementKey.EQUIP_ID:
      case EquipmentElementKey.EQUIP_TYPE:
      case EquipmentElementKey.EQUIP_TYPE_DESCRIPTION:
        hasChanged = approvePCMSDetection(dataElement) || hasChanged;
        break;
      case EquipmentElementKey.CLASS:
        hasChanged = setNotApplicableDetection(dataElement) || hasChanged;
        break;
      case EquipmentElementKey.U1_ON_FILE_YN:
      case EquipmentElementKey.CODE_STAMP_YN:
        hasChanged =
          approveAfterU1Document(dataElement, hasU1Document) || hasChanged;
        break;
      case EquipmentElementKey.UNIT_ID:
        hasChanged = approveUnitID(dataElement, unitId) || hasChanged;
        break;
      case EquipmentElementKey.OPERATING_STATUS:
        hasChanged = approveMALDetection(dataElement) || hasChanged;
        break;

      case EquipmentElementKey.SYSTEM:
      case EquipmentElementKey.P_ID_DRAWING_NO:
      case EquipmentElementKey.OPERATING_PRESSURE:
      case EquipmentElementKey.OPERATING_TEMP:
        hasChanged = approveMSDetection(dataElement) || hasChanged;
        break;
    }
  });
  return hasChanged;
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
