import { DataElement } from '.';

export type EquipmentData =
  | {
      equipmentElements: DataElement[];
    }
  | undefined;
