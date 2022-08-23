// import { SIDECAR } from 'constants/app';

import { useQuery } from 'react-query';
import {
  DocumentCategories,
  DocumentPayload,
} from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { FetchHeaders } from '../utils/fetch';

export const DOCUMENT_CATEGORIES_QUERY_KEY = ['documents', 'categories'];

export const documentError: any = {
  error: true,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getCategories = async (headers: FetchHeaders, tenant: string) => {
  /**
   * This is disabled and will be properlu implemented in future.
   * */
  // const response = await fetchGet<any>(
  //   `${'https://discover-api.staging.bluefield.cognite.ai'}/${tenant}/document/categories`,
  //   { headers }
  // );
  // if (response.success) {
  //   return response.data;
  // }
  // return documentError;

  return {
    documentType: [],
    fileCategory: [],
    fileType: [],
    labels: [],
    location: [],
    pageCount: [],
  };
};

export const useDocumentCategoryQuery = () => {
  // const headers = useJsonHeaders();
  const headers = {};
  const [tenant] = getTenantInfo();

  return useQuery<DocumentCategories | any>(
    DOCUMENT_CATEGORIES_QUERY_KEY,
    () => getCategories(headers, tenant),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
};

export const useQueryDocumentLabels = () => {
  const { data: categoryData, ...rest } = useDocumentCategoryQuery();

  let data: DocumentPayload[] = [];

  if (categoryData && 'labels' in categoryData) {
    data = categoryData.labels as DocumentPayload[];
  }

  return { data, ...rest };
};
