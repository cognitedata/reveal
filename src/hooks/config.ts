import { getEnv, getProject } from '@cognite/cdf-utilities';
import { useSearchParams } from 'react-router-dom';
import { omit } from 'lodash';
import { CLUSTER_KEY } from 'utils/constants';
import { isProduction } from 'utils/environment';

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

// TODO(DEGR-832)
export const useAppsApiBaseUrl = (): string => {
  // const cluster = getCluster();
  const env = getEnv();
  const stagingPart = isProduction ? '' : 'staging';
  const url = ['apps-api', stagingPart, env, 'cognite', 'ai']
    .filter(Boolean)
    .join('.');
  return `https://${url}`;
};

export const useProject = () => {
  return getProject();
};
