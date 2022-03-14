import { getSidecar } from 'config';
import { useLocation } from 'react-router-dom';
import { CLUSTER_KEY } from 'utils/constants';
import { isProduction } from 'utils/environment';
import { getProject } from 'utils/tenant';
import { useSearchParam } from './navigation';

export const useCluster = (): [string, (s: string) => void] => {
  const [searchParam, setSearchParam] = useSearchParam(CLUSTER_KEY);
  const { cdfCluster } = getSidecar();

  return [searchParam || cdfCluster, setSearchParam];
};

export const useAppsApiBaseUrl = (): string => {
  const [cluster] = useCluster();
  const stagingPart = isProduction ? '' : 'staging';
  const url = ['apps-api', stagingPart, cluster, 'cognite', 'ai']
    .filter(Boolean)
    .join('.');
  return `https://${url}`;
};

export const useProject = () => {
  const location = useLocation();
  return getProject(location.pathname);
};
