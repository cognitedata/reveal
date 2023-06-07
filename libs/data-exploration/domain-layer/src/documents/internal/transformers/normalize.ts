import { DocumentSearchItem } from '@cognite/sdk';

import { InternalDocument } from '../types';

// A function to convert data for documents
export const normalize = (
  documentSearchAPIResult: DocumentSearchItem[]
): InternalDocument[] => {
  return documentSearchAPIResult.map((documentSearchItem) => {
    const item = documentSearchItem.item;
    const documentName = item?.sourceFile?.name;
    const highlight = documentSearchItem.highlight;

    return {
      ...item,
      name: documentName,
      highlight,
    } as InternalDocument;
  });
};
