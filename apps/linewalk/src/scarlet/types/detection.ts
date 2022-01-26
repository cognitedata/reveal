import { Annotation } from '.';

export enum DetectionType {
  SCANNER = 'scanner',
  MANUAL = 'manual',
}

export enum DetectionState {
  OMITTED = 'omitted',
  APPROVED = 'approved',
}

export type Detection = Annotation & {
  id: string;
  key: string;
  type: DetectionType;
  value?: string;
  state?: DetectionState;
  isModified?: boolean;
};
