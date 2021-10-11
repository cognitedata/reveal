import { DocumentType } from 'modules/documentSearch/types';

export const getPathsFromDoc = (doc: DocumentType) => {
  const path = doc.doc.filepath ? [doc.doc.filepath] : [];

  if (doc.duplicates) {
    return [
      ...path,
      ...doc.duplicates?.map(
        (duplicateDocument) => duplicateDocument.doc.filepath
      ),
    ];
  }
  return path;
};
