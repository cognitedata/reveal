import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { Modules } from 'modules/sidebar/types';

export const useSeismicConfig = () => {
  return useProjectConfigByKey(Modules.SEISMIC);
};

export const useIsSeismicConfigEnabled = () => {
  const { data: seismicConfig } = useSeismicConfig();
  return !seismicConfig?.disabled;
};
