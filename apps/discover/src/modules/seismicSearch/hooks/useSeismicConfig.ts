import { ProjectConfigSeismic } from '@cognite/discover-api-types';

import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { Modules } from 'modules/sidebar/types';

export const useSeismicConfig = () => {
  return useProjectConfigByKey<ProjectConfigSeismic>(Modules.SEISMIC);
};
