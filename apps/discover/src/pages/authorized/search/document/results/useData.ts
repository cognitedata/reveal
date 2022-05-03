import { useQueryDocumentLabels } from 'services/documents/useDocumentQuery';
import { useDocumentSearchResultQuery } from 'services/documentSearch/queries/useDocumentSearchResultQuery';

import { useDeepMemo } from 'hooks/useDeep';
import { getFilteredLabels } from 'hooks/utils/getFilteredLabels';

export const useData = () => {
  const { data: allLabels, isFetched } = useQueryDocumentLabels();
  const { results, ...rest } = useDocumentSearchResultQuery();

  const resultsWithLabels = useDeepMemo(() => {
    return results?.hits.map((documentData) => ({
      ...documentData,
      labels: getFilteredLabels(documentData.doc.labels, allLabels),
    }));
  }, [allLabels, results?.hits, isFetched]);

  return { ...rest, results: resultsWithLabels };
};
