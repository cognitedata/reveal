import { v4 as uuid } from 'uuid';
import {
  AnnotationBoundingBox,
  Detection,
  DetectionType,
  EquipmentComponentType,
} from 'scarlet/types';

export const transformScannerDetection = (data: any): Detection => ({
  id: uuid(),
  key: data.value_type,
  type: DetectionType.SCANNER,
  scannerComponent:
    data.component_identifier || data.component_type
      ? {
          id: data.component_identifier,
          type: getEquipmentComponentType(data.component_type),
        }
      : undefined,
  ...(data.value_annotation && {
    boundingBox: getBoundingBox(data.value_annotation.bounding_box),
    pageNumber: data.value_annotation.page,
    value: data.value.trim(),
  }),
});

const getBoundingBox = (data?: any): AnnotationBoundingBox | undefined =>
  data && {
    x: data.x_min,
    y: data.y_min,
    width: data.x_max - data.x_min,
    height: data.y_max - data.y_min,
  };

export const getEquipmentComponentType = (
  type: string
): EquipmentComponentType | undefined => {
  switch (type.toLowerCase()) {
    case 'bundle':
      return EquipmentComponentType.BUNDLE;
    case 'head':
      return EquipmentComponentType.HEAD;
    case 'nozzle':
      return EquipmentComponentType.NOZZLE;
    case 'shell':
      return EquipmentComponentType.SHELL;
  }
  return undefined;
};
