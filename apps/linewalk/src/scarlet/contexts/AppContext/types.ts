import {
  APIState,
  EquipmentData,
  EquipmentListItem,
  PCMSData,
  EquipmentConfig,
  EquipmentDocument,
  DataElement,
  DataElementState,
  Detection,
  Annotation,
  EquipmentComponent,
  Remark,
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
      type: AppActionType.ADD_DETECTION;
      dataElement: DataElement;
      annotation: Annotation;
    }
  | {
      type: AppActionType.APPROVE_DETECTION;
      dataElement: DataElement;
      detection: Detection;
      isApproved: boolean;
    }
  | {
      type: AppActionType.REMOVE_DETECTION;
      dataElement: DataElement;
      detection: Detection;
    }
  | {
      type: AppActionType.SAVE_DETECTION;
      dataElement: DataElement;
      detection: Detection;
      value: string;
    }
  | {
      type: AppActionType.SHOW_DATA_ELEMENT_STATE_MODAL;
      dataElement: DataElement;
      state: DataElementState;
    }
  | {
      type: AppActionType.HIDE_DATA_ELEMENT_STATE_MODAL;
    }
  | {
      type: AppActionType.ADD_COMPONENT;
      component: EquipmentComponent;
    }
  | {
      type: AppActionType.DELETE_COMPONENTS;
      componentIds: string[];
    }
  | {
      type: AppActionType.ADD_REMARK;
      dataElement: DataElement;
      remark: Remark;
    }
  | {
      type: AppActionType.UPDATE_COMPONENTS;
      components: Partial<EquipmentComponent>[];
    }
  | {
      type: AppActionType.APPROVE_EQUIPMENT;
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
  ADD_DETECTION = 'add-detection',
  APPROVE_DETECTION = 'approve-detection',
  REMOVE_DETECTION = 'remove-detection',
  SAVE_DETECTION = 'save-detection',
  SHOW_DATA_ELEMENT_STATE_MODAL = 'show-data-element-state-modal',
  HIDE_DATA_ELEMENT_STATE_MODAL = 'hide-data-element-state-modal',
  CLEANUP_EQUIPMENT_DATA = 'cleanup-equipment-data',
  ADD_COMPONENT = 'add-component',
  DELETE_COMPONENTS = 'delete-components',
  UPDATE_COMPONENTS = 'update-components',
  ADD_REMARK = 'add-remark',
  APPROVE_EQUIPMENT = 'approve-equipment',
}
