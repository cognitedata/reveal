import { getFlow } from '@cognite/auth-utils';

import { getAuthHeaders } from '../auth';

export const getDefaultHeader = () => ({
  'Content-Type': 'application/json',
});

export const getJsonHeaders = (
  extras: Record<string, string> = {},
  useIdToken = false
) => {
  const { flow } = getFlow();

  return {
    ...getDefaultHeader(),
    ...getAuthHeaders({
      useIdToken,
    }),
    flow,
    ...extras,
  };
};
