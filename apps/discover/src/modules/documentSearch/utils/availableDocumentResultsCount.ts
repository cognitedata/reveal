import get from 'lodash/get';
import invert from 'lodash/invert';
import set from 'lodash/set';

import { DocumentCategory, DocumentPayload } from 'modules/api/documents/types';
import { DOCUMENT_CATEGORY_TO_DOCUMENT_QUERY_FACETS_KEY_MAP } from 'modules/documentSearch/constants';
import {
  DocumentQueryFacet,
  DocumentResultFacets,
} from 'modules/documentSearch/types';
import { getEmptyDocumentStateFacets } from 'modules/documentSearch/utils';

export const patchDocumentPayloadCount = (
  currentContent: DocumentPayload[],
  patchContent: (DocumentPayload | DocumentQueryFacet)[],
  shouldUseCurrentItemCount?: boolean
): DocumentPayload[] => {
  return currentContent.map((currentItem) => {
    const itemToPatch = patchContent.find((patchItem) =>
      'id' in currentItem
        ? patchItem.name === currentItem.id
        : patchItem.name === currentItem.name
    );

    if (!itemToPatch) {
      const count = shouldUseCurrentItemCount ? currentItem.count : 0;
      return { ...currentItem, count };
    }

    return { ...currentItem, count: itemToPatch.count };
  });
};

export const mapDocumentCategoryToDocumentResultFacets = (
  documentCategory: DocumentCategory
): DocumentResultFacets => {
  const documentResultFacets = getEmptyDocumentStateFacets();
  const documentQueryFacetsToDocumentCategoryKeyMap = invert(
    DOCUMENT_CATEGORY_TO_DOCUMENT_QUERY_FACETS_KEY_MAP
  );
  const documentQueryFacetsKeys = Object.keys(
    documentQueryFacetsToDocumentCategoryKeyMap
  );

  documentQueryFacetsKeys.forEach((key) => {
    const documentCategoryKey = get(
      documentQueryFacetsToDocumentCategoryKeyMap,
      key
    );
    const documentPayload = get(documentCategory, documentCategoryKey);
    set(documentResultFacets, key, documentPayload);
  });

  return documentResultFacets;
};
