import { DataElementType, DataElementUnit, EquipmentComponentType } from '.';

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
};

export type EquipmentConfig = {
  [key in 'componentElements' | 'equipmentElements']: {
    [key: string]: DataElementConfig;
  };
} & {
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
