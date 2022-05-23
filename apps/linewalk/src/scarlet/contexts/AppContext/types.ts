import {
  APIState,
  EquipmentData,
  EquipmentListItem,
  EquipmentConfig,
  EquipmentDocument,
  DataElement,
  DataElementState,
  Detection,
  EquipmentComponent,
  Remark,
  Facility,
  UnitListByFacility,
} from 'scarlet/types';

export type AppStateEquipmentList = {
  unitId: string;
  equipments: EquipmentListItem[];
};

export type AppStateDataElementModal = {
  dataElements: DataElement[];
  state: DataElementState;
};

export type AppState = {
  facility?: Facility;
  unitId: string;
  equipmentId: string;
  documents: APIState<EquipmentDocument[]>;
  equipment: APIState<EquipmentData>;
  equipmentConfig: APIState<EquipmentConfig>;
  equipmentList?: AppStateEquipmentList;
  dataElementModal?: AppStateDataElementModal;
  saveState: APIState<EquipmentData> & { isAutoSave?: boolean };
  unitListByFacility: APIState<UnitListByFacility>;
};

export type AppAction =
  | {
      type: AppActionType.INIT_UNITS;
      unitListByFacility: APIState<UnitListByFacility>;
    }
  | {
      type: AppActionType.INIT_EQUIPMENT;
      facility: Facility;
      unitId: string;
      equipmentId: string;
    }
  | {
      type: AppActionType.SET_DOCUMENTS;
      documents: APIState<EquipmentDocument[]>;
    }
  | {
      type: AppActionType.SET_EQUIPMENT;
      equipment: APIState<EquipmentData>;
      isAutoSave?: boolean;
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
      type: AppActionType.UPDATE_DATA_ELEMENTS_STATE;
      dataElements: DataElement[];
      state: DataElementState;
      stateReason?: string;
    }
  | {
      type: AppActionType.REPLACE_DETECTION;
      dataElement: DataElement;
      detection: Detection;
    }
  | {
      type: AppActionType.REMOVE_DETECTION;
      dataElement: DataElement;
      detection: Detection;
    }
  | {
      type: AppActionType.SHOW_DATA_ELEMENT_STATE_MODAL;
      dataElements: DataElement[];
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
      type: AppActionType.SET_LINKED_DATA_ELEMENTS;
      detection: Detection;
      dataElements: DataElement[];
    };

export enum AppActionType {
  INIT_UNITS = 'init-units',
  // equipment
  INIT_EQUIPMENT = 'init-equipment',
  SET_DOCUMENTS = 'set-documents',
  SET_EQUIPMENT = 'set-equipment',
  SET_EQUIPMENT_CONFIG = 'set-equipment-config',
  SET_SAVE_SATE = 'set-save-state',
  UPDATE_DATA_ELEMENTS_STATE = 'update-data-elements-state',
  REPLACE_DETECTION = 'replace-detection',
  REMOVE_DETECTION = 'remove-detection',
  SHOW_DATA_ELEMENT_STATE_MODAL = 'show-data-element-state-modal',
  HIDE_DATA_ELEMENT_STATE_MODAL = 'hide-data-element-state-modal',
  CLEANUP_EQUIPMENT_DATA = 'cleanup-equipment-data',
  ADD_COMPONENT = 'add-component',
  DELETE_COMPONENTS = 'delete-components',
  UPDATE_COMPONENTS = 'update-components',
  ADD_REMARK = 'add-remark',
  SET_LINKED_DATA_ELEMENTS = 'set-linked-data-elements',
}
