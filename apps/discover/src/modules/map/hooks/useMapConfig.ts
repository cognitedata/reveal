import { ProjectConfigMap } from '@cognite/discover-api-types';

import { useProjectConfigByKey } from 'hooks/useProjectConfig';

export const useMapConfig = () => {
  return useProjectConfigByKey<ProjectConfigMap>('map');
};
