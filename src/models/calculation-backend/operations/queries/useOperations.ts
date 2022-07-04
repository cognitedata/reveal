import { useProject } from 'hooks/config';
import useConfiguration from 'models/calculation-backend/configuration/hooks/useConfiguration';
import { fetchOperations } from 'models/calculation-backend/operations/services/fetchOperations';
import { useQuery } from 'react-query';

const useOperations = () => {
  const config = useConfiguration();
  const project = useProject();

  return useQuery({
    queryKey: ['calculation-backend', 'operations'],
    queryFn: async () => (await fetchOperations(config, project)).data,
    enabled: !!config && !!project,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    cacheTime: 6 * 60 * 60 * 1000,
  });
};

export default useOperations;
