import { fetchGet, FetchHeaders } from '_helpers/fetch';
import { SIDECAR } from 'constants/app';

import {
  DocumentError,
  DocumentCategoryResult,
  DocumentPayload,
} from './types';

const documentError: DocumentError = {
  error: true,
};
export const documents = {
  category: async (headers: FetchHeaders, tenant: string) => {
    const response = await fetchGet<DocumentCategoryResult>(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/document/categories`,
      { headers }
    );
    if (response.success) {
      return response.data;
    }
    return documentError;
  },
  documentTypes: async (headers: FetchHeaders, tenant: string) => {
    const response = await documents.category(headers, tenant);

    if ('error' in response) {
      return [];
    }

    return response.labels.map((type: DocumentPayload) => type.name);
  },
};
