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
) => {
  preApproveEquipmentElements(
    equipment.equipmentElements,
    hasU1Document,
    unitId
  );
};

const preApproveEquipmentElements = (
  dataElements: DataElement[],
  hasU1Document: boolean,
  unitId: string
) => {
  dataElements.forEach((dataElement) => {
    const hasPrimaryDetection = dataElement.detections.some(
      (detection) => detection.isPrimary
    );

    if (hasPrimaryDetection) return;

    switch (dataElement.key) {
      case EquipmentElementKey.EQUIP_ID:
      case EquipmentElementKey.EQUIP_TYPE:
      case EquipmentElementKey.ASSET_NO:
        approvePCMSDetection(dataElement);
        break;
      case EquipmentElementKey.CLASS:
        setNotApplicableDetection(dataElement);
        break;
      case EquipmentElementKey.U1_ON_FILE_YN:
      case EquipmentElementKey.CODE_STAMP_YN:
        approveAfterU1Document(dataElement, hasU1Document);
        break;
      case EquipmentElementKey.UNIT_ID:
        approveUnitID(dataElement, unitId);
        break;
      case EquipmentElementKey.OPERATING_STATUS:
        approveMALDetection(dataElement);
        break;
    }
  });
};

const approvePCMSDetection = (dataElement: DataElement) => {
  const pcmsDetection = getDataElementPCMSDetection(dataElement);
  if (pcmsDetection) {
    pcmsDetection.state = DetectionState.APPROVED;
    pcmsDetection.isPrimary = true;
    dataElement.state = DataElementState.APPROVED;
  }
};

const setNotApplicableDetection = (dataElement: DataElement) => {
  dataElement.detections.push({
    id: uuid(),
    type: DetectionType.MANUAL_INPUT,
    value: 'N/A',
    state: DetectionState.APPROVED,
    isPrimary: true,
  });
  dataElement.state = DataElementState.APPROVED;
};

const approveAfterU1Document = (
  dataElement: DataElement,
  hasU1Document: boolean
) => {
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
  }
};

const approveUnitID = (dataElement: DataElement, unitId: string) => {
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
};

const approveMALDetection = (dataElement: DataElement) => {
  const malDetection = dataElement.detections.find(
    (detection) => detection.type === DetectionType.MAL
  );

  if (malDetection) {
    malDetection.state = DetectionState.APPROVED;
    malDetection.isPrimary = true;
    dataElement.state = DataElementState.APPROVED;
  }
};
