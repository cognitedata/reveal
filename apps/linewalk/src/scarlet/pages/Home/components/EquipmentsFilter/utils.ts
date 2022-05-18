import { getEquipmentTypeLabel } from 'scarlet/utils';
import { EquipmentStatus, EquipmentType } from 'scarlet/types';

export type EquipmentTypeOption = {
  value: 'all' | EquipmentType;
  label: string;
};
export type EquipmentStatusOption = {
  value: 'all' | EquipmentStatus;
  label: string;
};

const allOption = { value: 'all', label: 'All' };

export const equipmentTypeOptionsDictionary = {
  all: allOption,
  [EquipmentType.AIR_COOLER]: {
    value: EquipmentType.AIR_COOLER,
    label: getEquipmentTypeLabel(EquipmentType.AIR_COOLER)!,
  },
  [EquipmentType.EXCHANGER]: {
    value: EquipmentType.EXCHANGER,
    label: getEquipmentTypeLabel(EquipmentType.EXCHANGER)!,
  },
  [EquipmentType.VESSEL]: {
    value: EquipmentType.VESSEL,
    label: getEquipmentTypeLabel(EquipmentType.VESSEL)!,
  },
};

export const equipmentTypeOptions = Object.values(
  equipmentTypeOptionsDictionary
);

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
