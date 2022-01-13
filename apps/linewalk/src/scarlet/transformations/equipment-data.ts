import { v4 as uuid } from 'uuid';
import {
  equipmentElementsConfig,
  equipmentElementsPriorityConfig,
} from 'scarlet/config';
import {
  DataElement,
  EquipmentElementKey,
  EquipmentData,
  ScannerData,
  ScannerDataElement,
  DataElementBoundingBox,
  DataElementOrigin,
} from 'scarlet/types';

export const getEquipmentData = (scannerData: ScannerData): EquipmentData => {
  const equipmentElements = getEquipmentElements(scannerData);

  return { equipmentElements };
};

const getEquipmentElements = (scannerData: ScannerData): DataElement[] => {
  if (!scannerData) return [];

  const { equipment } = scannerData;
  const keysWithoutPriority = Object.keys(equipment).filter(
    (key) =>
      !equipmentElementsPriorityConfig.includes(key as EquipmentElementKey) &&
      key !== 'components'
  );

  return [
    ...equipmentElementsPriorityConfig.filter((key) => key in equipment),
    ...keysWithoutPriority,
  ]
    .map((key) => {
      const element = equipment[key];
      let elementConfig = equipmentElementsConfig[key as EquipmentElementKey];

      if (!elementConfig) {
        console.error('Missing configuration for equipment key:', key);
        elementConfig = { label: key };
      }

      return {
        id: uuid(),
        scannerKey: key,
        value: element?.value,
        unit: element?.unit,
        boundingBox: getBoundingBox(element),
        sourceDocumentId: element?.source_document_id,
        pageNumber: element?.page_number,
        origin: DataElementOrigin.EQUIPMENT,
        ...elementConfig,
      } as DataElement;
    })
    .filter((item) => item);
};

const getBoundingBox = (
  element?: ScannerDataElement | null
): DataElementBoundingBox | undefined =>
  element?.bounding_box && {
    x: element!.bounding_box.x_min,
    y: element!.bounding_box.y_min,
    width: element!.bounding_box.x_max - element!.bounding_box.x_min,
    height: element!.bounding_box.y_max - element!.bounding_box.y_min,
  };
