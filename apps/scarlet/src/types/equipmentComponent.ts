import { DataElement } from '.';

export type EquipmentComponent = {
  id: string;
  name: string;
  circuitId: string;
  pcmsExternalId?: string;
  type: EquipmentComponentType;
  componentElements: DataElement[];
};

export type EquipmentComponentGroup = {
  type: EquipmentComponentType;
  label: string;
};

export enum EquipmentComponentType {
  HEAD = 'head',
  NOZZLE = 'nozzle',
  SHELL = 'shell',
  BUNDLE = 'bundle',
  COURSE = 'course',
  CHANNEL = 'channel',
}
