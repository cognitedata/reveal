import { v4 as uuid } from 'uuid';
import {
  AnnotationBoundingBox,
  DetectionType,
  EquipmentComponentType,
  ScannerDetection,
} from 'scarlet/types';

export const transformScannerAnnotation = (
  { annotatedResourceId, data }: any,
  externalIds: Record<number, string>
): ScannerDetection => {
  let scannerComponent;
  const componentType = getEquipmentComponentType(data.componentType);
  if (data.componentName && componentType) {
    scannerComponent = {
      id: data.componentName,
      type: componentType,
    };
  }

  return {
    id: uuid(),
    key: data.fieldName,
    type: DetectionType.SCANNER,
    documentExternalId: externalIds[annotatedResourceId],
    pageNumber: data.pageNumber,
    value: data.value,
    scannerComponent,
    boundingBox: getBoundingBox(data.boundingBox),
  };
};

const getBoundingBox = (data?: any): AnnotationBoundingBox | undefined =>
  data && {
    x: data.xMin,
    y: data.yMin,
    width: data.xMax - data.xMin,
    height: data.yMax - data.yMin,
  };

const getEquipmentComponentType = (
  type?: string
): EquipmentComponentType | undefined => {
  if (!type) return undefined;
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
