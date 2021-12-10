import { documentDateToDate } from '_helpers/dateConversion';
import { useQueryDocumentLabels } from 'modules/api/documents/useDocumentQuery';
import { useDocumentSearchResultQuery } from 'modules/documentSearch/hooks/useDocumentSearchResultQuery';

import { useDeepMemo } from './useDeep';
import { getFilteredLabels } from './utils/getFilteredLabels';

export const useDocumentsForTable = () => {
  const { data: allLabels, isFetched } = useQueryDocumentLabels();
  const { data: documentResult } = useDocumentSearchResultQuery();

  return useDeepMemo(() => {
    const documents = documentResult.hits.map((documentData) => ({
      ...documentData,
      labels: getFilteredLabels(documentData.doc.labels, allLabels),
    }));
    return documentDateToDate(documents);
  }, [allLabels, documentResult, isFetched]);
};
