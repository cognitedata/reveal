import { getFilteredLabels } from 'domain/documents/internal/transformers/getFilteredLabels';
import { useQueryDocumentLabels } from 'domain/documents/service/queries/useDocumentQuery';
import { useDocumentSearchResultQuery } from 'domain/documents/service/queries/useDocumentSearchResultQuery';

import { useDeepMemo } from 'hooks/useDeep';

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
