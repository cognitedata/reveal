import { Modules } from 'modules/sidebar/types';

import { useProjectConfigByKey } from '../../../hooks/useProjectConfig';

export const useWellConfig = () => {
  return useProjectConfigByKey(Modules.WELLS);
};
