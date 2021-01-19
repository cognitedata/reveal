// this will end up from coming from sidecar eventually
export const getClusterFromCdfApiBaseUrl = (cdfApiBaseUrl: string) => {
  return cdfApiBaseUrl.split('https://')[1].split('.')[0];
};
