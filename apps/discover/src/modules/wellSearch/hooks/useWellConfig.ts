import { ProjectConfig } from '@cognite/discover-api-types';

import { Modules } from 'modules/sidebar/types';

import { useProjectConfigByKey } from '../../../hooks/useProjectConfig';

export const useWellConfig = () => {
  return useProjectConfigByKey<ProjectConfig['wells']>(Modules.WELLS);
};
