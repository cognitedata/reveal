import { EquipmentComponent, DataElement, EquipmentType } from '.';

export type EquipmentData = {
  type: EquipmentType;
  equipmentElements: DataElement[];
  components: EquipmentComponent[];
  isApproved?: boolean;
  created: number;
  modified?: number;
};
