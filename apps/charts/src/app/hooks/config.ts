import { useSearchParams } from 'react-router-dom';

import { CLUSTER_KEY } from '@charts-app/utils/constants';
import { omit } from 'lodash';

import { getProject } from '@cognite/cdf-utilities';

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

export const useProject = () => {
  return getProject();
};
