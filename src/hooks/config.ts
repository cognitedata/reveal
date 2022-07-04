import { useLocation } from 'react-router-dom';
import { CLUSTER_KEY } from 'utils/constants';
import { isProduction } from 'models/charts/config/utils/environment';
import { getProject } from 'utils/tenant';
import { useSearchParam } from './navigation';

export const useCluster = (): [string | undefined, (s: string) => void] => {
  const [cluster, setCluster] = useSearchParam(CLUSTER_KEY);

  return [cluster, setCluster];
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
