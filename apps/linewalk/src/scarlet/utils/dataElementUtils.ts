import {
  BooleanDetectionValue,
  DataElement,
  DataElementConfig,
  DataElementOrigin,
  DataElementType,
  DataElementUnit,
  Detection,
  DetectionState,
  DetectionType,
  EquipmentConfig,
} from 'scarlet/types';

import { getLocaleDateString } from '.';

export const getDataElementPrimaryDetection = (
  dataElement: DataElement
): Detection | undefined => {
  const detections = dataElement.detections.filter(
    (item) => item.state !== DetectionState.OMITTED
  );

  const primaryDetection = detections.find((item) => item.isPrimary);

  if (primaryDetection) return primaryDetection;

  const approvedDetection = detections.find(
    (item) =>
      item.state === DetectionState.APPROVED && item.type !== DetectionType.PCMS
  );

  if (approvedDetection) return approvedDetection;

  const nonPCMSDetection = detections.find(
    (item) => item.type !== DetectionType.PCMS
  );

  if (nonPCMSDetection) return nonPCMSDetection;

  const pcmsDetection = getDataElementPCMSDetection(dataElement);
  if (pcmsDetection) return pcmsDetection;

  return undefined;
};

export const getDataElementPCMSDetection = (
  dataElement: DataElement
): Detection | undefined => {
  const detection = dataElement.detections.find(
    (item) => item.type === DetectionType.PCMS
  );
  return ['', 'N/A', undefined].includes(detection?.value)
    ? undefined
    : detection;
};

export const getDataElementValue = (
  dataElement: DataElement
): string | undefined => {
  return getDataElementPrimaryDetection(dataElement)?.value;
};

export const getIsDataElementValueAvailable = (
  data: DataElement | string = ''
): boolean => {
  const value = typeof data === 'string' ? data : getDataElementValue(data);

  return value !== null && value !== undefined && value !== '';
};

export const getDataElementConfig = (
  config?: EquipmentConfig,
  dataElement?: DataElement
): DataElementConfig | undefined => {
  if (!dataElement) return undefined;

  const configElements =
    dataElement.origin === DataElementOrigin.COMPONENT
      ? config?.componentElements
      : config?.equipmentElements;

  return (
    (configElements && configElements[dataElement.key]) ||
    ({
      key: dataElement.key,
      label: dataElement.key,
    } as DataElementConfig)
  );
};

export const getDataElementTypeLabel = (
  dataElement?: DataElement
): string | undefined => {
  switch (dataElement?.origin) {
    case DataElementOrigin.EQUIPMENT:
      return 'Equipment';
    case DataElementOrigin.COMPONENT:
      return 'Component';
    default:
      return undefined;
  }
};

export const getPrettifiedDataElementValue = (
  value?: string,
  unit?: DataElementUnit,
  type?: DataElementType
) => {
  if (value === undefined || value === null) return value;

  let result = getPrettifiedValue(value, type);
  if (unit) result += getPrettifiedDataElementUnit(unit);
  return result;
};

export const getPrettifiedValue = (
  value: string,
  type?: DataElementType
): string => {
  switch (type) {
    case DataElementType.DATE:
      return getLocaleDateString(value);
    case DataElementType.BOOLEAN:
      return getPrettifiedBooleanDataElementValue(
        value as BooleanDetectionValue
      );
    default:
      return value;
  }
};

export const getPrettifiedBooleanDataElementValue = (
  value: BooleanDetectionValue
) => {
  switch (value) {
    case BooleanDetectionValue.YES:
      return 'Yes';
    case BooleanDetectionValue.NO:
      return 'No';
    default:
      return 'N/A';
  }
};

export const getPrettifiedDataElementUnit = (unit?: DataElementUnit) => {
  switch (unit) {
    case DataElementUnit.PSI:
      return 'psi';
    case DataElementUnit.FAHRENHEIT:
      return '°F';
    case DataElementUnit.FEET:
      return 'ft';
    case DataElementUnit.DEGREES:
      return 'deg';
    case DataElementUnit.INCHES:
      return 'in';

    default:
      return '';
  }
};

export const getDataElementHasDiscrepancy = (
  dataElement: DataElement,
  unit?: DataElementUnit,
  type?: DataElementType
): boolean => {
  const primaryDetection = getDataElementPrimaryDetection(dataElement);
  if (!primaryDetection || primaryDetection.type === DetectionType.PCMS) {
    return false;
  }

  const pcmsDetection = getDataElementPCMSDetection(dataElement);
  if (!pcmsDetection) return false;

  const primaryDetectionValue = getPrettifiedDataElementValue(
    primaryDetection?.value,
    unit,
    type
  );

  const pcmsDetectionValue = getPrettifiedDataElementValue(
    pcmsDetection?.value,
    unit,
    type
  );

  return primaryDetectionValue !== pcmsDetectionValue;
};
