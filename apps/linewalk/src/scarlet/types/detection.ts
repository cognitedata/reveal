import { Annotation, EquipmentComponentType } from '.';

export enum DetectionType {
  SCANNER = 'scanner',
  MANUAL = 'manual',
  PCMS = 'pcms',
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
  state?: DetectionState;
  isModified?: boolean;
  scannerComponent?: {
    id: string;
    type: EquipmentComponentType;
  };
};
