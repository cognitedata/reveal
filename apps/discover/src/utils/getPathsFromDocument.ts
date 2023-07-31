import { DocumentType } from 'modules/documentSearch/types';

export const getPathsFromDoc = (doc: DocumentType) => {
  const path = doc.fullFilePath ? [doc.fullFilePath] : [];

  if (doc.duplicates) {
    return [
      ...path,
      ...(doc.duplicates || []).map(
        (duplicateDocument) =>
          duplicateDocument.fullFilePath || duplicateDocument.doc.filepath
      ),
    ];
  }
  return path;
};
