import {
  DataElementType,
  DataElementUnit,
  EquipmentComponentType,
  Formula,
} from '.';

export enum EquipmentType {
  AIR_COOLER = 'air_cooler',
  EXCHANGER = 'exchanger',
  VESSEL = 'vessel',
}

export type ComponentGroup = {
  type: EquipmentComponentType;
  label: string;
  componentElementKeys: string[];
};

export type DataElementConfig = {
  key: string;
  label: string;
  type?: DataElementType;
  unit?: DataElementUnit;
  values?: string[];
  formula?: Formula;
};

export type EquipmentConfig = {
  [key in 'componentElements' | 'equipmentElements']: {
    [key: string]: DataElementConfig;
  };
} & {
  creatingAppVersions: string[];
  equipmentTypes: {
    [key in EquipmentType]: {
      type: EquipmentType;
      label: string;
      equipmentElementKeys: string[];
      componentTypes: {
        [key: string]: ComponentGroup;
      };
    };
  };
};
