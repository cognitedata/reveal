import { useMemo } from 'react';

import { documentDateToDate } from '_helpers/dateConversion';
import { useQueryDocumentLabels } from 'modules/api/documents/useDocumentQuery';
import { useDocuments } from 'modules/documentSearch/selectors';

import { getFilteredLabels } from './utils/getFilteredLabels';

export const useDocumentsForTable = () => {
  const { data: allLabels, isFetched } = useQueryDocumentLabels();
  const {
    result: { hits },
  } = useDocuments();

  return useMemo(() => {
    const documents = hits.map((documentData) => ({
      ...documentData,
      labels: getFilteredLabels(documentData.doc.labels, allLabels),
    }));
    return documentDateToDate(documents);
  }, [allLabels, hits, isFetched]);
};
