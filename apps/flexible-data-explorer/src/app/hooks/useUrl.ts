import { useSDK } from '@cognite/sdk-provider';

const FUSION_URL = 'https://fusion.cognite.com';

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
  return `${FUSION_URL}/${project}/explore/search?cluster=${cluster}&env=${env}`;
};

export const useGetChartsUrl = () => {
  const project = useGetProject();
  const cluster = useGetCluster();
  const env = useGetEnv();
  return `${FUSION_URL}/${project}/charts?cluster=${cluster}&env=${env}`;
};

export const useGetCanvasUrl = () => {
  const project = useGetProject();
  const cluster = useGetCluster();
  const env = useGetEnv();
  return `${FUSION_URL}/${project}/industrial-canvas/canvas?cluster=${cluster}&env=${env}`;
};
