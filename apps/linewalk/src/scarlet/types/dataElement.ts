import { Detection } from '.';

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
  detections: Detection[];
  state: DataElementState;
  stateReason?: string;
  componentId?: string;
};
