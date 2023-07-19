export enum DocumentType {
  U1 = 'U1',
}

export type EquipmentDocument = {
  id: number;
  name: string;
  externalId?: string;
  downloadUrl: string;
  type?: string;
};
