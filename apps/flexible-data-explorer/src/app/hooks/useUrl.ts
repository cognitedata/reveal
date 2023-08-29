import { useAuth } from '@cognite/auth-react';

const FUSION_URL = 'fusion.cognite.com';

const useGetEnv = () => {
  const { cluster } = useAuth();
  const env = cluster?.split('.')?.[0];

  // In Fusion, for the EU1-1 cluster (api.cognitedata.com) there are no need of env. variable
  if (env === 'api' || !env) {
    return '';
  }

  return env;
};

export const useGetAssetCentricDataExplorerUrl = () => {
  const env = useGetEnv();

  const { cluster, project } = useAuth();

  return `https://${FUSION_URL}/${project}/explore/search?cluster=${cluster}&env=${env}`;
};

export const useGetChartsUrl = () => {
  const env = useGetEnv();

  const { cluster, project } = useAuth();

  return `https://${FUSION_URL}/${project}/charts?cluster=${cluster}&env=${env}`;
};

export const useGetCanvasUrl = () => {
  const env = useGetEnv();

  const { cluster, project } = useAuth();

  return `https://${FUSION_URL}/${project}/industrial-canvas?cluster=${cluster}&env=${env}`;
};
