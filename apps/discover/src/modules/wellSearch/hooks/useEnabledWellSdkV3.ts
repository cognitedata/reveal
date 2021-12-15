import { useProjectConfigByKey } from '../../../hooks/useProjectConfig';

export const useEnabledWellSdkV3 = () => {
  const { data } = useProjectConfigByKey('general');

  return !!data?.enableWellSDKV3;
};
