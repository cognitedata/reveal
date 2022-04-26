import { EquipmentStatus } from './equipment';

export type EquipmentListItem = {
  id: string;
  type?: string;
  status?: EquipmentStatus;
  progress?: number;
  modifiedBy?: string;
};
