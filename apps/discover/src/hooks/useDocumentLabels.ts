import { useMemo } from 'react';

import { useQueryDocumentLabels } from 'services/documents/useDocumentQuery';

import { EMPTY_ARRAY } from 'constants/empty';
import { DocumentLabel } from 'modules/documentSearch/types';

import { getFilteredLabels } from './utils/getFilteredLabels';

export const useDocumentLabelsByExternalIds = (
  documentLabels: DocumentLabel[] = EMPTY_ARRAY
) => {
  const { data: allLabels, isFetched } = useQueryDocumentLabels();

  return useMemo(
    () => getFilteredLabels(documentLabels, allLabels),
    [allLabels, documentLabels, isFetched]
  );
};
