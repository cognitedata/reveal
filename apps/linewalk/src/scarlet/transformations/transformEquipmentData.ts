import {
  DataElement,
  EquipmentData,
  DataElementOrigin,
  ScannerDetection,
  EquipmentConfig,
  EquipmentType,
  DataElementState,
} from 'scarlet/types';

export const transformEquipmentData = ({
  config,
  scannerDetections,
  equipmentState,
  type,
}: {
  config?: EquipmentConfig;
  scannerDetections?: ScannerDetection[];
  equipmentState?: EquipmentData;
  type?: EquipmentType;
}): EquipmentData | undefined => {
  if (!type || !config || !config.equipmentTypes[type]) return undefined;
  const equipmentElements = getEquipmentElements(
    type,
    config,
    scannerDetections,
    equipmentState?.equipmentElements
  );

  return { type, equipmentElements };
};

const getEquipmentElements = (
  type: EquipmentType,
  config: EquipmentConfig,
  scannerDetections?: ScannerDetection[],
  savedElements: DataElement[] = []
): DataElement[] => {
  const { equipmentElementKeys } = config.equipmentTypes[type];

  const equipmentElements = equipmentElementKeys
    .map((key) => {
      const itemDetections = scannerDetections?.filter(
        (detection) => detection.key === key && detection.valueAnnotation
      );

      const value = itemDetections?.find(
        (detection) => detection.valueAnnotation.value
      )?.valueAnnotation.value;

      if (!config.equipmentElements[key]) return undefined;

      const savedElement = savedElements.find((item) => item.key === key);

      // do not update omitted or approved data-elements
      // only label, unit and type could be updated from config file
      if (savedElement?.state !== DataElementState.PENDING) {
        return {
          ...savedElement,
          ...config.equipmentElements[key],
        };
      }

      return {
        ...savedElement,
        ...config.equipmentElements[key],
        origin: DataElementOrigin.EQUIPMENT,
        value,
        scannerDetections: itemDetections,
        state: DataElementState.PENDING,
      } as DataElement;
    })
    .filter((item) => item);

  return equipmentElements as DataElement[];
};
