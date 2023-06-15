export const getIotHubUrl = (resourceUri: string) => {
  return `//api.staging.azure-dev.cogniteapp.com/aziot-proxy/${resourceUri.substring(
    0,
    resourceUri.indexOf('.')
  )}/aziot`;
};
