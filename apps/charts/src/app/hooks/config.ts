import { getCluster, getProject } from '@cognite/cdf-utilities';
import { parseEnvFromCluster } from '@cognite/login-utils';
import { useSearchParams } from 'react-router-dom';
import { omit } from 'lodash';
import { CLUSTER_KEY } from '@charts-app/utils/constants';
import { isProduction } from '@charts-app/utils/environment';

export const useCluster = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const cluster = searchParams.get(CLUSTER_KEY);

  const setCluster = (newClusterParam?: string) => {
    const newCluster = newClusterParam
      ? {
          ...searchParams,
          [CLUSTER_KEY]: encodeURIComponent(newClusterParam),
        }
      : omit(searchParams, CLUSTER_KEY);

    setSearchParams(newCluster);
  };

  return [cluster ? decodeURIComponent(cluster) : undefined, setCluster];
};

export const useAppsApiBaseUrl = (sdkClientBaseUrl: string): string => {
  const cluster = getCluster();
  const clusterEnv = parseEnvFromCluster(cluster);
  const env =
    clusterEnv === '' ? parseEnvFromCluster(sdkClientBaseUrl) : clusterEnv;
  const stagingPart = isProduction ? '' : 'staging';
  const url = ['apps-api', stagingPart, env, 'cognite', 'ai']
    .filter(Boolean)
    .join('.');
  return `https://${url}`;
};

export const useProject = () => {
  return getProject();
};
