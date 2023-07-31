import {
  DataElementType,
  DataElementUnit,
  EquipmentComponentType,
  Formula,
} from '.';

export enum EquipmentType {
  EQUIPMENT_DEFAULT = 'equipment_default',
  AIR_RECEIVER = 'air_receiver',
  EXCHANGER_DOUBLE_PIPE = 'exchanger_double_pipe',
  INCINERATOR = 'incinerator',
  REACTOR = 'reactor',
  BOILER_PROCESS_STEAM_GENERATOR = 'boiler_process_steam_generator',
  DRUM = 'drum',
  EXCHANGER_AIR_COOLED = 'exchanger_air_cooler',
  EXCHANGER_SHELL_TUBE = 'exchanger_shell_tube',
  FILTER_STRAINER = 'filter_strainer',
  FLARE_STACK = 'flare_stack',
  TOWER = 'tower',
  VESSEL = 'vessel',
  EXCHANGER = 'exchanger',
  AIR_COOLER = 'air_cooler',
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
