import {
  APIState,
  EquipmentData,
  EquipmentListItem,
  PCMSData,
  EquipmentConfig,
  EquipmentDocument,
} from 'scarlet/types';

export type StorageState = {
  pcms: APIState<PCMSData>;
  documents: APIState<EquipmentDocument[]>;
  equipment: APIState<EquipmentData>;
  equipmentConfig: APIState<EquipmentConfig>;
  equipmentList?: {
    unitName: string;
    equipments: EquipmentListItem[];
  };
};

export type StorageAction =
  | {
      type: StorageActionType.SET_PCMS;
      pcms: APIState<PCMSData>;
    }
  | {
      type: StorageActionType.SET_DOCUMENTS;
      documents: APIState<EquipmentDocument[]>;
    }
  | {
      type: StorageActionType.SET_EQUIPMENT;
      equipment: APIState<EquipmentData>;
    }
  | {
      type: StorageActionType.RESET_EQUIPMENT_DATA;
    }
  | {
      type: StorageActionType.SET_EQUIPMENT_LIST;
      unitName: string;
      equipments: EquipmentListItem[];
    }
  | {
      type: StorageActionType.SET_EQUIPMENT_CONFIG;
      config: APIState<EquipmentConfig>;
    };

export enum StorageActionType {
  // equipment
  SET_PCMS = 'set-pcms',
  SET_DOCUMENTS = 'set-documents',
  SET_EQUIPMENT = 'set-equipment',
  SET_EQUIPMENT_CONFIG = 'set-equipment-config',
  RESET_EQUIPMENT_DATA = 'reset-equipment-data',

  // equipment-list
  SET_EQUIPMENT_LIST = 'set-equipment-list',
}
