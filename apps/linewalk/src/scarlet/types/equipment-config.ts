import { DataElementType, DataElementUnit } from '.';

export enum EquipmentType {
  AIR_COOLER = 'air_cooler',
  EXCHANGER = 'exchanger',
  VESSEL = 'vessel',
}

export type EquipmentConfig = {
  [key in 'componentElements' | 'equipmentElements']: {
    [key: string]: {
      key: string;
      label: string;
      type?: DataElementType;
      unit?: DataElementUnit;
    };
  };
} & {
  equipmentTypes: {
    [key in EquipmentType]: {
      type: EquipmentType;
      label: string;
      equipmentElementKeys: string[];
      componentTypes: {
        [key: string]: {
          type: string;
          label: string;
          componentElementKeys: string[];
        };
      };
    };
  };
};
