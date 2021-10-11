import { dateToEpoch, isValidDate, SHORT_DATE_FORMAT } from '_helpers/date';
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

// Date columns in the table can use this to sort the date values
export const sortDates = (val1: Date | string, val2: Date | string): number => {
  if (!isValidDate(val1) && !isValidDate(val2)) return 0;
  if (!isValidDate(val1)) return -1;
  if (!isValidDate(val2)) return 1;
  return (
    dateToEpoch(val1, SHORT_DATE_FORMAT) - dateToEpoch(val2, SHORT_DATE_FORMAT)
  );
};
