import { Annotation, EquipmentComponentType } from '.';

export enum DetectionType {
  SCANNER = 'scanner',
  MANUAL = 'manual',
  PCMS = 'pcms',
  MANUAL_INPUT = 'manual-input',
  MANUAL_EXTERNAL = 'manuel-external',
}

export enum DetectionState {
  OMITTED = 'omitted',
  APPROVED = 'approved',
}

export type Detection = Partial<Annotation> & {
  id: string;
  key: string;
  type: DetectionType;
  value?: string;
  externalSource?: string;
  state?: DetectionState;
  isPrimary?: boolean;
  isModified?: boolean;
  scannerComponent?: {
    id: string;
    type: EquipmentComponentType;
  };
};
