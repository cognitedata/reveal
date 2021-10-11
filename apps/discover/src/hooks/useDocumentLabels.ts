import { useMemo } from 'react';

import { useQueryDocumentLabels } from 'modules/api/documents/useDocumentQuery';
import { DocumentLabel } from 'modules/documentSearch/types';

import { getFilteredLabels } from './utils/getFilteredLabels';

export const useDocumentLabelsByExternalIds = (
  documentLabels: DocumentLabel[]
) => {
  const { data: allLabels, isFetched } = useQueryDocumentLabels();

  return useMemo(
    () => getFilteredLabels(documentLabels, allLabels),
    [allLabels, documentLabels, isFetched]
  );
};
