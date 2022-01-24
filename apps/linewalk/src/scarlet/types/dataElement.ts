import { ScannerDetection } from '.';

export enum DataElementOrigin {
  EQUIPMENT = 'equipment',
  COMPONENT = 'component',
}

export enum DataElementType {
  STRING = 'string',
  INT = 'int',
  FLOAT = 'float',
  BOOLEAN = 'bool',
  DATE = 'date',
}

export enum DataElementUnit {
  PSI = 'psi',
  FAHRENHEIT = 'F',
  FEET = 'feet',
  DEGREES = 'degrees',
  INCHES = 'inches',
}

export enum DataElementState {
  OMITTED = 'omitted',
  PENDING = 'pending',
  APPROVED = 'approved',
}

export type DataElement = {
  key: string;
  origin: DataElementOrigin;
  label: string;
  value?: string;
  type?: DataElementType;
  unit?: DataElementUnit;
  scannerDetections?: ScannerDetection[];
  state: DataElementState;
  stateReason?: string;
};
