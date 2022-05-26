import { getCategories } from 'domain/documents/service/network/getCategories';

import { FetchHeaders } from 'utils/fetch';

import { DocumentPayload } from '@cognite/discover-api-types';

export const getAllDocumentTypes = () => {
  return async (headers: FetchHeaders, tenant: string) => {
    const response = await getCategories(headers, tenant);

    if ('error' in response) {
      return [];
    }

    return response.labels.map((type: DocumentPayload) => type.name);
  };
};
