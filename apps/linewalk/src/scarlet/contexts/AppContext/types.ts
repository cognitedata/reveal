import {
  APIState,
  EquipmentData,
  EquipmentListItem,
  PCMSData,
  EquipmentConfig,
  EquipmentDocument,
  DataElement,
  DataElementState,
} from 'scarlet/types';

export type AppState = {
  unitName: string;
  equipmentName: string;
  pcms: APIState<PCMSData>;
  documents: APIState<EquipmentDocument[]>;
  equipment: APIState<EquipmentData>;
  equipmentConfig: APIState<EquipmentConfig>;
  equipmentList?: {
    unitName: string;
    equipments: EquipmentListItem[];
  };
  dataElementModal?: {
    dataElement: DataElement;
    state: DataElementState;
  };
  saveState: APIState<EquipmentData>;
};

export type AppAction =
  | {
      type: AppActionType.INIT_EQUIPMENT;
      unitName: string;
      equipmentName: string;
    }
  | {
      type: AppActionType.SET_PCMS;
      pcms: APIState<PCMSData>;
    }
  | {
      type: AppActionType.SET_DOCUMENTS;
      documents: APIState<EquipmentDocument[]>;
    }
  | {
      type: AppActionType.SET_EQUIPMENT;
      equipment: APIState<EquipmentData>;
    }
  | {
      type: AppActionType.CLEANUP_EQUIPMENT_DATA;
    }
  | {
      type: AppActionType.SET_EQUIPMENT_LIST;
      unitName: string;
      equipments: EquipmentListItem[];
    }
  | {
      type: AppActionType.SET_EQUIPMENT_CONFIG;
      config: APIState<EquipmentConfig>;
    }
  | {
      type: AppActionType.SET_SAVE_SATE;
      saveState: APIState<EquipmentData>;
    }
  | {
      type: AppActionType.UPDATE_DATA_ELEMENT_STATE;
      dataElement: DataElement;
      state: DataElementState;
      stateReason?: string;
    }
  | {
      type: AppActionType.SHOW_DATA_ELEMENT_STATE_MODAL;
      dataElement: DataElement;
      state: DataElementState;
    }
  | {
      type: AppActionType.HIDE_DATA_ELEMENT_STATE_MODAL;
    };

export enum AppActionType {
  // equipment
  INIT_EQUIPMENT = 'init-equipment',
  SET_PCMS = 'set-pcms',
  SET_DOCUMENTS = 'set-documents',
  SET_EQUIPMENT = 'set-equipment',
  SET_EQUIPMENT_CONFIG = 'set-equipment-config',
  SET_SAVE_SATE = 'set-save-state',
  UPDATE_DATA_ELEMENT_STATE = 'update-data-element-state',
  SHOW_DATA_ELEMENT_STATE_MODAL = 'show-data-element-state-modal',
  HIDE_DATA_ELEMENT_STATE_MODAL = 'hide-data-element-state-modal',
  CLEANUP_EQUIPMENT_DATA = 'cleanup-equipment-data',

  // equipment-list
  SET_EQUIPMENT_LIST = 'set-equipment-list',
}
