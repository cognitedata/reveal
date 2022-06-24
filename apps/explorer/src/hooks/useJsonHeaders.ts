import { getDefaultHeader, getAuthHeaders } from '@cognite/react-container';

export const useJsonHeaders = (
  extras: Record<string, string> = {},
  useIdToken = false
) => {
  return {
    ...getDefaultHeader(),
    ...getAuthHeaders({
      useIdToken,
    }),
    ...extras,
  };
};
