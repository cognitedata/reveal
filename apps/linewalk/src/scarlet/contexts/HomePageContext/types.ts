import {
  APIState,
  EquipmentListItem,
  Facility,
  UnitListItem,
} from 'scarlet/types';

export type ExportEquipmentsModal = {
  isExportSelectedEquipments: boolean;
};

export type HomePageState = {
  facility?: Facility;
  unitId?: string;
  unitListQuery: APIState<UnitListItem[]>;
  equipmentListQuery: APIState<EquipmentListItem[]>;
  selectedEquipmentIds: string[];
  exportEquipmentsModal?: ExportEquipmentsModal;
};

export type HomePageAction =
  | {
      type: HomePageActionType.CLOSE_EXPORT_EQUIPMENTS;
    }
  | {
      type: HomePageActionType.EXPORT_EQUIPMENTS;
      isExportSelectedEquipments: boolean;
    }
  | {
      type: HomePageActionType.SELECT_EQUIPMENTS;
      selectedEquipmentIds: string[];
    }
  | {
      type: HomePageActionType.SET_EQUIPMENT_LIST;
      equipmentListQuery: APIState<EquipmentListItem[]>;
    }
  | {
      type: HomePageActionType.SET_FACILITY;
      facility: Facility;
      unitId?: string;
    }
  | {
      type: HomePageActionType.SET_UNIT;
      unitId: string;
    }
  | {
      type: HomePageActionType.SET_UNIT_LIST;
      unitListQuery: APIState<UnitListItem[]>;
    };

export enum HomePageActionType {
  CLOSE_EXPORT_EQUIPMENTS = 'close-export-equipments',
  EXPORT_EQUIPMENTS = 'export-equipments',
  SELECT_EQUIPMENTS = 'select-equipments',
  SET_EQUIPMENT_LIST = 'set-equipment-list',
  SET_FACILITY = 'set-facility',
  SET_UNIT = 'set-unit',
  SET_UNIT_LIST = 'set-unit-list',
}
