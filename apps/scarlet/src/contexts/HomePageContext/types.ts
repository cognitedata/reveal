import { APIState, EquipmentListItem, Facility, UnitListItem } from 'types';

export type HomePageState = {
  facility?: Facility;
  unitId?: string;
  unitListQuery: APIState<UnitListItem[]>;
  equipmentListQuery: APIState<EquipmentListItem[]>;
};

export type HomePageAction =
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
  SET_EQUIPMENT_LIST = 'set-equipment-list',
  SET_FACILITY = 'set-facility',
  SET_UNIT = 'set-unit',
  SET_UNIT_LIST = 'set-unit-list',
}
