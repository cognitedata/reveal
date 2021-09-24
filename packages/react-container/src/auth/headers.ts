export const getAuthorizationHeader = (
  token: string
): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
});

export const getHeaders = (
  token: string,
  extras?: Record<string, string>
): Record<string, Record<string, string>> => ({
  headers: getAuthorizationHeader(token),
  ...extras,
});

export const extractToken = (authorization = ''): string =>
  authorization.replace(/^Bearer /, '');
