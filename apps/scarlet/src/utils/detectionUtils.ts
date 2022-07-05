import { AnnotationBoundingBox, Detection, DetectionType } from 'types';

export const isSameScannerDetection = (a: Detection, b: Detection) =>
  a.type === DetectionType.SCANNER &&
  b.type === DetectionType.SCANNER &&
  a.documentExternalId === b.documentExternalId &&
  a.pageNumber === b.pageNumber &&
  isSameAnnotation(a.boundingBox, b.boundingBox);

export const isSameAnnotation = (
  a?: AnnotationBoundingBox,
  b?: AnnotationBoundingBox
) =>
  (a &&
    b &&
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.height === b.height) ||
  false;

export const getDetectionSourceLabel = (detection?: Detection) => {
  const defaultLabel = 'No source';

  if (!detection) return defaultLabel;

  switch (detection.type) {
    case DetectionType.PCMS:
      return 'PCMS';
    case DetectionType.MANUAL_INPUT:
      return 'Manual input';
    case DetectionType.MANUAL_EXTERNAL:
      return 'External source';
    case DetectionType.MANUAL:
    case DetectionType.SCANNER:
      return detection.documentExternalId || defaultLabel;
    case DetectionType.MAL:
      return 'Master Asset List';
    case DetectionType.MS2:
      return 'MS2';
    case DetectionType.MS3:
      return 'MS3';
    case DetectionType.LINKED:
      return 'Linked field';
    case DetectionType.CALCULATED:
      return 'Calculated field';
    default:
      return defaultLabel;
  }
};

export const getDetectionSourceAcronym = (detection: Detection) => {
  switch (detection.type) {
    case DetectionType.PCMS:
      return 'PCMS';
    case DetectionType.MANUAL_INPUT:
      return 'Input';
    case DetectionType.MANUAL_EXTERNAL:
      return 'Ext.';
    case DetectionType.MAL:
      return 'MAL';
    case DetectionType.MS2:
      return 'MS2';
    case DetectionType.MS3:
      return 'MS3';
    case DetectionType.LINKED:
      return 'Linked';
    case DetectionType.CALCULATED:
      return 'CALC';
  }

  const type = detection.documentExternalId
    ?.toLocaleLowerCase()
    ?.split('.')[0]
    ?.split('_')[2];

  switch (type) {
    case 'nameplate':
      return 'NPL';
    case 'miscellaneous':
      return 'MISC';
    case 'mech drawing':
      return 'MECH';
  }

  return type?.toUpperCase();
};
