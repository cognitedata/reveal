import { EquipmentElementKey } from '.';

export enum DataElementOrigin {
  EQUIPMENT = 'equipment',
  COMPONENT = 'component',
}

export enum DataElementType {
  STRING = 'string',
  INT = 'int',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  ORIENTATION = 'vertical,horizontal',
  DATE = 'date',
}

export enum DataElementUnit {
  PSI = 'psi',
  FAHRENHEIT = 'F',
  FEET = 'ft',
}

export type DataElement = {
  id: string;
  scannerKey: EquipmentElementKey | string;
  label: string;
  value?: string | number;
  type?: DataElementType;
  unit?: DataElementUnit;
  pcmsKey?: string;
  confidence?: number;
  sourceDocumentId?: number;
  pageNumber?: number;
  boundingBox?: DataElementBoundingBox;
  origin: DataElementOrigin;
};

export type DataElementBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};
