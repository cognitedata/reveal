import {
  DocumentType,
  DocumentTypeDataModel,
} from 'modules/documentSearch/types';

import { getHumanReadableFileSize } from './number';

export const documentDateToDate = (
  documents: DocumentType[]
): DocumentTypeDataModel[] => {
  return documents.map((result: DocumentType) => {
    return {
      ...result,
      size: getHumanReadableFileSize(result.doc.filesize),
      created: new Date(result.doc.creationdate),
      modified: new Date(result.doc.lastmodified),
    };
  });
};
