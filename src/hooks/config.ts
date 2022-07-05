import { useLocation } from 'react-router-dom';
import { CLUSTER_KEY } from 'utils/constants';
import { getProject } from 'utils/tenant';
import { useSearchParam } from './navigation';

export const useCluster = (): [string | undefined, (s: string) => void] => {
  const [cluster, setCluster] = useSearchParam(CLUSTER_KEY);

  return [cluster, setCluster];
};

export const useProject = () => {
  const location = useLocation();
  return getProject(location.pathname);
};
