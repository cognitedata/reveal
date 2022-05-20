import { log, getAuthHeaders } from '@cognite/react-container';

import { fetchGet } from './fetchGet';
import { InspectResult } from './types';

export const getInspectedToken = async (
  cdfApiBaseUrl: string
): Promise<InspectResult> => {
  let result: InspectResult = { capabilities: [] };

  try {
    result = await fetchGet(`${cdfApiBaseUrl}/api/v1/token/inspect`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
  } catch (error) {
    log(String(error));
  }

  return result;
};
