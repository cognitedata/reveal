const getCluster = (baseUrl: string): string => {
  const cluster = baseUrl.slice(
    baseUrl.lastIndexOf('/') + 1,
    baseUrl.indexOf('.')
  );

  return cluster === 'api' ? '' : cluster;
};
export const getDataExplorerBackendEndpoint = (
  project: string,
  baseUrl: string,
  isProduction: boolean
) => {
  const cluster = getCluster(baseUrl);

  return `https://api.${isProduction ? '' : 'staging.'}${
    cluster ? `${cluster}.` : ''
  }cogniteapp.com/data-explorer-backend/${project}`;
};
