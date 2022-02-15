// import { useProjectConfigByKey } from '../../../hooks/useProjectConfig';
// testing this new one with select:
import { useProjectConfigByKey } from 'services/projectConfig/useProjectConfigQuery';

// returns undefined if the result is not loaded yet
// this is important, because else we will be using this flag in v2 mode
// before it is loaded and could be triggering the wrong views/calls
export const useEnabledWellSdkV3 = () => {
  const { data } = useProjectConfigByKey('general');

  if (!data) {
    return undefined;
  }

  return data.enableWellSDKV3;
};
