import {
  APIState,
  DocumentsData,
  EquipmentData,
  EquipmentListItem,
  PCMSData,
} from 'scarlet/types';

export type StorageState = {
  pcms: APIState<PCMSData>;
  documents: APIState<DocumentsData>;
  equipment: APIState<EquipmentData>;
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
      documents: APIState<DocumentsData>;
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
    };

export enum StorageActionType {
  // equipment
  SET_PCMS = 'set-pcms',
  SET_DOCUMENTS = 'set-documents',
  SET_EQUIPMENT = 'set-equipment',
  RESET_EQUIPMENT_DATA = 'reset-equipment-data',

  // equipment-list
  SET_EQUIPMENT_LIST = 'set-equipment-list',
}
