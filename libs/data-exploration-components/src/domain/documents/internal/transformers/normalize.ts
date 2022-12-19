import { DocumentSearchItem } from '@cognite/sdk';
import { Document } from '@data-exploration-components/domain/documents';

// A function to convert data for documents
export const normalize = (
  documentSearchAPIResult: DocumentSearchItem[]
): Document[] => {
  return documentSearchAPIResult.map((documentSearchItem) => {
    const item = documentSearchItem.item;
    const documentName = item.sourceFile.name;
    const highlight = documentSearchItem.highlight;

    return {
      ...item,
      name: documentName,
      highlight,
    } as Document;
  });
};
