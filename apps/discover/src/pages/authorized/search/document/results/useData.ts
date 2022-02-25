import { useQueryDocumentLabels } from 'services/documents/useDocumentQuery';

import { useDeepMemo } from 'hooks/useDeep';
import { getFilteredLabels } from 'hooks/utils/getFilteredLabels';
import { useDocumentResultHits } from 'modules/documentSearch/hooks/useDocumentResultHits';

export const useData = () => {
  const { data: allLabels, isFetched } = useQueryDocumentLabels();
  const documentResultHits = useDocumentResultHits();

  return useDeepMemo(() => {
    return documentResultHits.map((documentData) => ({
      ...documentData,
      labels: getFilteredLabels(documentData.doc.labels, allLabels),
    }));
  }, [allLabels, documentResultHits, isFetched]);
};
