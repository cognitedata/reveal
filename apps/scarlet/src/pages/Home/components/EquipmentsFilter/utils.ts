import { EquipmentStatus, EquipmentType } from 'types';

export type EquipmentTypeOption = {
  value: 'all' | EquipmentType;
  label: string;
};
export type EquipmentStatusOption = {
  value: 'all' | EquipmentStatus;
  label: string;
};

const allOption = { value: 'all', label: 'All' };

export const equipmentStatusOptionsDictionary = {
  all: allOption,

  [EquipmentStatus.NOT_STARTED]: {
    value: EquipmentStatus.NOT_STARTED,
    label: EquipmentStatus.NOT_STARTED,
  },
  [EquipmentStatus.ONGOING]: {
    value: EquipmentStatus.ONGOING,
    label: EquipmentStatus.ONGOING,
  },
  [EquipmentStatus.COMPLETED]: {
    value: EquipmentStatus.COMPLETED,
    label: EquipmentStatus.COMPLETED,
  },
};

export const equipmentStatusOptions = Object.values(
  equipmentStatusOptionsDictionary
);
