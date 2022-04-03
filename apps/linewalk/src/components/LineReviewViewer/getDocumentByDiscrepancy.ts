import { CogniteOrnate } from '@cognite/ornate';
import { ParsedDocument } from 'modules/lineReviews/types';

import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import { Discrepancy } from './LineReviewViewer';

const getDocumentByDiscrepancy = (
  ornateRef: CogniteOrnate | undefined,
  documents: ParsedDocument[],
  discrepancy: Discrepancy
): ParsedDocument | undefined => {
  if (ornateRef === undefined) {
    console.warn('ornateRef is undefined');
    return undefined;
  }

  if (documents.length === 0) {
    console.warn('documents array is empty');
    return undefined;
  }

  const node = ornateRef.stage.findOne(`#${discrepancy.id}`);
  if (node === undefined) {
    console.log('node not found');
    return undefined;
  }

  const { parent } = node;
  if (parent === null) {
    console.log('parent is null');
    return undefined;
  }

  return documents.find(
    (document) =>
      getKonvaSelectorSlugByExternalId(document.externalId) === parent.id()
  );
};

export default getDocumentByDiscrepancy;
