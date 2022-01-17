import {
  DataElement,
  EquipmentElementKey,
  EquipmentData,
  DataElementOrigin,
  ScannerDetection,
  EquipmentConfig,
  EquipmentType,
} from 'scarlet/types';
import { equipmentElementsPriority } from 'scarlet/config';

export const transformEquipmentData = ({
  config,
  scannerDetections,
  type,
}: {
  config?: EquipmentConfig;
  scannerDetections?: ScannerDetection[];
  type?: EquipmentType;
}): EquipmentData | undefined => {
  if (!type || !config || !config.equipmentTypes[type]) return undefined;

  const equipmentElements = getEquipmentElements(
    type,
    config,
    scannerDetections
  );

  return { type, equipmentElements };
};

const getEquipmentElements = (
  type: EquipmentType,
  config: EquipmentConfig,
  scannerDetections?: ScannerDetection[]
): DataElement[] => {
  const { equipmentElementKeys } = config.equipmentTypes[type];

  const keysWithoutPriority = equipmentElementKeys.filter(
    (key) =>
      !equipmentElementsPriority.includes(key as EquipmentElementKey) &&
      key !== 'components'
  );

  return [
    ...equipmentElementsPriority.filter((key) =>
      equipmentElementKeys.includes(key)
    ),
    ...keysWithoutPriority,
  ]
    .map((key) => {
      const itemDetections = scannerDetections?.filter(
        (detection) => detection.key === key && detection.valueAnnotation
      );

      const value = itemDetections?.find(
        (detection) => detection.valueAnnotation.value
      )?.valueAnnotation.value;

      return {
        ...config.equipmentElements[key],
        origin: DataElementOrigin.EQUIPMENT,
        value,
        scannerDetections: itemDetections,
      } as DataElement;
    })
    .filter((item) => item);
};
