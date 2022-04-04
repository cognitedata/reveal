import { Detection, DetectionType } from 'scarlet/types';

export const isSameScannerDetection = (a: Detection, b: Detection) =>
  a.type === DetectionType.SCANNER &&
  b.type === DetectionType.SCANNER &&
  a.documentExternalId === b.documentExternalId &&
  a.pageNumber === b.pageNumber &&
  a.boundingBox?.x === b.boundingBox?.x &&
  a.boundingBox?.y === b.boundingBox?.y &&
  a.boundingBox?.width === b?.boundingBox?.width &&
  a.boundingBox?.height === b?.boundingBox?.height;

export const getDetectionSourceLabel = (detection: Detection) => {
  const defaultLabel = 'No source';

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
