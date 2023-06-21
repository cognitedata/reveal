import { useSDK } from '@cognite/sdk-provider';

export const useGetProject = () => {
  const sdk = useSDK();
  return sdk.project;
};

export const useGetBaseUrl = () => {
  const sdk = useSDK();
  // https://greenfield.cognitedata.com
  return sdk.getBaseUrl();
};

export const useGetCluster = () => {
  //greenfield.cognitedata.com
  const baseUrl = useGetBaseUrl();
  return baseUrl.split('https://')[1];
};

export const useGetEnv = () => {
  const cluster = useGetCluster();
  return cluster.split('.')[0];
};

export const useGetAssetCentricDataExplorerUrl = () => {
  const project = useGetProject();
  const cluster = useGetCluster();
  const env = useGetEnv();
  return `https://fusion.cognite.com/${project}/explore/search?cluster=${cluster}&env=${env}`;
};
