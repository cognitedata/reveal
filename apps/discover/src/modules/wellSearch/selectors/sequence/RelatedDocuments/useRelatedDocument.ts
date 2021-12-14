import { useMemo } from 'react';

import { DOCUMENT_FALLBACK_SEARCH_LIMIT } from 'modules/documentSearch/constants';
import { useDocumentConfig } from 'modules/documentSearch/hooks';
import { useLabelsQuery } from 'modules/documentSearch/hooks/useLabelsQuery';
import { getDocumentsFacetsInfo } from 'modules/documentSearch/utils';
import { getFacetsCounts } from 'modules/documentSearch/utils/getFacetsCounts';
import { useWellInspect } from 'modules/wellInspect/selectors';
import { columns } from 'pages/authorized/search/well/inspect/modules/relatedDocument/constant';

import { useQuerySavedRelatedDocuments } from './RelatedDocumentUseQuery';

export const useRelatedDocumentData = () => {
  const limit = useRelatedDocumentLimit();
  const { data, isLoading } = useQuerySavedRelatedDocuments(limit);

  return useMemo(() => {
    return {
      data: data?.hits || [],
      facets: data?.facets,
      aggregates: data?.aggregates,
      isLoading,
    };
  }, [data, data?.facets]);
};

export const useRelatedDocumentLimit = () => {
  const { data: config } = useDocumentConfig();
  return config?.defaultLimit || DOCUMENT_FALLBACK_SEARCH_LIMIT;
};

export const useRelatedDocumentDataStats = () => {
  const { data, facets, aggregates } = useRelatedDocumentData();
  const labels = useLabelsQuery();
  return useMemo(() => {
    const documentInformation =
      facets && getDocumentsFacetsInfo(facets, labels);
    return {
      total: data.length,
      facets,
      facetCounts: getFacetsCounts(aggregates),
      documentInformation,
    };
  }, [data, facets]);
};

export const useSelectedColumns = () => {
  const { selectedRelatedDocumentsColumns } = useWellInspect();
  return useMemo(() => {
    return Object.keys(columns)
      .filter((key) => selectedRelatedDocumentsColumns[key])
      .map((key) => columns[key]);
  }, [selectedRelatedDocumentsColumns]);
};
