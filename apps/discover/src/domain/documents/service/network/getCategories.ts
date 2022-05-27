import { fetchGet, FetchHeaders } from 'utils/fetch';

import { SIDECAR } from 'constants/app';

import { DocumentError, DocumentCategoriesResult } from '../../internal/types';

export const documentError: DocumentError = {
  error: true,
};

export const getCategories = async (headers: FetchHeaders, tenant: string) => {
  const response = await fetchGet<DocumentCategoriesResult>(
    `${SIDECAR.discoverApiBaseUrl}/${tenant}/document/categories`,
    { headers }
  );
  if (response.success) {
    return response.data;
  }
  return documentError;
};
