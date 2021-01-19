// export const getClusterFromAppsApiBaseUrl = (appsApiBaseUrl: string) => {
//   return appsApiBaseUrl.split('https://apps-api.')[1].split('.')[0];
// };

export const getClusterFromCdfApiBaseUrl = (cdfApiBaseUrl: string) => {
  return cdfApiBaseUrl.split('https://')[1].split('.')[0];
};
