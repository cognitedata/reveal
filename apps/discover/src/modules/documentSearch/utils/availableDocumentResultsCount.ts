import isUndefined from 'lodash/isUndefined';

import { DocumentPayload } from '@cognite/discover-api-types';

export const patchDocumentPayloadCount = (
  currentContent: DocumentPayload[],
  patchContent?: DocumentPayload[]
): DocumentPayload[] => {
  if (!patchContent) {
    return currentContent;
  }

  return currentContent.map((currentItem) => {
    const itemToPatch = patchContent.find((patchItem) =>
      'id' in currentItem
        ? patchItem.name === currentItem.id
        : patchItem.name === currentItem.name
    );

    const patchedItem = isUndefined(itemToPatch)
      ? { ...currentItem, count: 0 }
      : { ...currentItem, count: itemToPatch.count };

    return patchedItem;
  });
};
