import { EquipmentData } from '.';

export type UnitData = {
  equipments: {
    [equipmentName: string]: Partial<EquipmentData>;
  };
};
