import { EquipmentData } from '.';

export type UnitData = {
  equipments: {
    [equipmentId: string]: Partial<EquipmentData>;
  };
};
