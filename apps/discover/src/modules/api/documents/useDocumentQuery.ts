import { useQuery } from 'react-query';

import { getTenantInfo } from '@cognite/react-container';

import { DOCUMENT_CATEGORIES_QUERY_KEY } from 'constants/react-query';
import {
  DocumentPayloadLabel,
  DocumentCategory,
  DocumentError,
} from 'modules/api/documents/types';
import { discoverAPI, getJsonHeaders } from 'modules/api/service';

export const useDocumentCategoryQuery = () => {
  const headers = getJsonHeaders();
  const [tenant] = getTenantInfo();

  return useQuery<DocumentCategory | DocumentError>(
    DOCUMENT_CATEGORIES_QUERY_KEY,
    () => discoverAPI.documents.category(headers, tenant),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
};

export const useQueryDocumentLabels = () => {
  const { data: categoryData, ...rest } = useDocumentCategoryQuery();

  let data: DocumentPayloadLabel[] = [];

  if (categoryData && 'labels' in categoryData) {
    data = categoryData.labels as DocumentPayloadLabel[];
  }

  return { data, ...rest };
};
