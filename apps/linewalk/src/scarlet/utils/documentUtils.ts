import { DocumentType, EquipmentDocument } from 'scarlet/types';

export const findU1Document = (documents: EquipmentDocument[] = []) =>
  documents?.find((document) => document.type === DocumentType.U1);
