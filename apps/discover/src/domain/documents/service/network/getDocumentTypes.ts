import { FetchHeaders } from 'utils/fetch';

import { DocumentPayload } from '@cognite/discover-api-types';

import { getCategories } from './getCategories';

export const getDocumentTypes = async (
  headers: FetchHeaders,
  tenant: string
) => {
  const response = await getCategories(headers, tenant);

  if ('error' in response) {
    return [];
  }

  return response.labels.map((type: DocumentPayload) => type.name);
};
