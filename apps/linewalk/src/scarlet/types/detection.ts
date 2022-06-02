import { Annotation, EquipmentComponentType } from '.';

export enum DetectionType {
  SCANNER = 'scanner',
  MANUAL = 'manual',
  PCMS = 'pcms',
  MAL = 'mal',
  MS2 = 'MS2',
  MS3 = 'MS3',
  MANUAL_INPUT = 'manual-input',
  MANUAL_EXTERNAL = 'manuel-external',
  LINKED = 'linked',
  CALCULATED = 'calculated',
}

export enum DetectionState {
  OMITTED = 'omitted',
  APPROVED = 'approved',
}

export type Detection = Partial<Annotation> & {
  id: string;
  type: DetectionType;
  detectionOriginId?: string;
  value?: string;
  externalSource?: string;
  state?: DetectionState;
  isPrimary?: boolean;
  scannerComponent?: {
    id: string;
    type: EquipmentComponentType;
  };
};

export enum BooleanDetectionValue {
  YES = 'Y',
  NO = 'N',
}

export type ScannerDetection = Detection & { key: string };
