import { useMemo } from 'react';
import { useQueryClient } from 'react-query';

import get from 'lodash/get';
import set from 'lodash/set';

import { DOCUMENT_CATEGORIES_QUERY_KEY } from 'constants/react-query';
import { useDocumentCategoryQuery } from 'modules/api/documents/useDocumentQuery';
import { DOCUMENT_CATEGORY_TO_DOCUMENT_QUERY_FACETS_KEY_MAP } from 'modules/documentSearch/constants';
import { useDocumentPayloadWithAvailableResultsCount } from 'modules/documentSearch/hooks/useDocumentPayloadWithAvailableResultsCount';
import {
  useFacets,
  useDocumentResultCount,
} from 'modules/documentSearch/selectors';
import { useSearchPhrase } from 'modules/sidebar/selectors';

export const useDocumentQueryFacets = () => {
  const queryClient = useQueryClient();
  const { isLoading, error, data } = useDocumentCategoryQuery();
  const facetsState = useFacets();
  const documentResultCount = useDocumentResultCount();
  const searchPhrase = useSearchPhrase();
  const getDocumentPayloadWithAvailableResultsCount =
    useDocumentPayloadWithAvailableResultsCount();
  const categoryDataKeys = Object.keys(
    DOCUMENT_CATEGORY_TO_DOCUMENT_QUERY_FACETS_KEY_MAP
  );

  return useMemo(() => {
    if (!data || 'error' in data || (!documentResultCount && !searchPhrase)) {
      return { isLoading, error, data };
    }

    const categoryData = data;

    categoryDataKeys.forEach((key) => {
      const documentQueryFacetsKey = get(
        DOCUMENT_CATEGORY_TO_DOCUMENT_QUERY_FACETS_KEY_MAP,
        key
      );
      const documentPayload = getDocumentPayloadWithAvailableResultsCount(
        documentQueryFacetsKey
      );
      set(categoryData, key, documentPayload);
    });

    if (documentResultCount) {
      queryClient.setQueryData(DOCUMENT_CATEGORIES_QUERY_KEY, categoryData);
    }

    return { isLoading, error, data: categoryData };
  }, [data, facetsState]);
};
