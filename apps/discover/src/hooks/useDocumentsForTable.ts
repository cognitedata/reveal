import { documentDateToDate } from '_helpers/dateConversion';
import { useQueryDocumentLabels } from 'modules/api/documents/useDocumentQuery';
import { useDocumentResultHits } from 'modules/documentSearch/hooks/useDocumentResultHits';

import { useDeepMemo } from './useDeep';
import { getFilteredLabels } from './utils/getFilteredLabels';

export const useDocumentsForTable = () => {
  const { data: allLabels, isFetched } = useQueryDocumentLabels();
  const documentResultHits = useDocumentResultHits();

  return useDeepMemo(() => {
    const documents = documentResultHits.map((documentData) => ({
      ...documentData,
      labels: getFilteredLabels(documentData.doc.labels, allLabels),
    }));
    return documentDateToDate(documents);
  }, [allLabels, documentResultHits, isFetched]);
};
