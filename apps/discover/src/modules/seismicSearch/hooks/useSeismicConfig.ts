import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { Modules } from 'modules/sidebar/types';

export const useSeismicConfig = () => {
  return useProjectConfigByKey(Modules.SEISMIC);
};
