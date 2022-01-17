export enum DocumentType {
  U1 = 'U1',
}

export type EquipmentDocument = {
  id: number;
  externalId?: string;
  downloadUrl: string;
  type?: string;
};
