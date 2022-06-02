import { Detection, Remark } from '.';
import { DataElementConfig } from './equipmentConfig';

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
  ENUM = 'enum',
}

export enum DataElementUnit {
  PSI = 'psi',
  FAHRENHEIT = 'fahrenheit',
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
  id: string;
  key: string;
  origin: DataElementOrigin;
  detections: Detection[];
  state: DataElementState;
  touched?: boolean;
  stateReason?: string;
  componentId?: string;
  remarks?: Remark[];
  config: DataElementConfig;
};
