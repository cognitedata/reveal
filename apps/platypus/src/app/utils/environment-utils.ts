export const getEnvironment = (hostname = window.location.hostname): string => {
  if (
    hostname.includes('staging') ||
    hostname.includes('localhost') ||
    hostname.includes('pr-')
  ) {
    return 'DEVELOPMENT';
  }
  return 'PRODUCTION';
};
