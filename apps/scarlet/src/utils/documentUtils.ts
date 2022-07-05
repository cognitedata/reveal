import { DocumentType, EquipmentDocument } from 'types';

export const findU1Document = (documents: EquipmentDocument[] = []) =>
  documents?.find((document) => document.type === DocumentType.U1);
