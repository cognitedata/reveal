import { useProjectConfigByKey } from 'hooks/useProjectConfig';

export const useMapConfig = () => {
  return useProjectConfigByKey('map');
};
