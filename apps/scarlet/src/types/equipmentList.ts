import { EquipmentStatus } from './equipment';

export type EquipmentListItem = {
  id: string;
  type?: string;
  typeName: string;
  status: EquipmentStatus;
  progress?: number;
  modifiedBy?: string;
  u1doc?: string;
};
