export const HTTP_STATUS_MESSAGES = {
  200: 'OK',
  201: 'Created',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  500: 'Internal Server Error',
} as const;

export const DEFAULT_ERROR_MESSAGE = 'Unknown Discover error';
export const DEFAULT_ERROR_STATUS = 500;
