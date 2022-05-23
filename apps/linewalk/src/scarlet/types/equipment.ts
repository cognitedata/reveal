import { EquipmentComponent, DataElement, EquipmentType } from '.';

export type EquipmentData = {
  type: EquipmentType;
  equipmentElements: DataElement[];
  components: EquipmentComponent[];
  created: number;
  modified?: number;
};

export enum EquipmentStatus {
  NOT_STARTED = 'Not started',
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
}
