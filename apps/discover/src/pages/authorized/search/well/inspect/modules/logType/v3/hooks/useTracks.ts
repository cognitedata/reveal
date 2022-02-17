import get from 'lodash/get';

import { useDeepMemo } from 'hooks/useDeep';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { TrackConfig } from 'tenants/types';

export const useTracks = () => {
  const { data: config } = useWellConfig();

  return useDeepMemo(() => {
    return get(config, 'logs.tracks', [])
      .filter((track: TrackConfig) => track.enabled)
      .map((track: TrackConfig) => track.name);
  }, [config]);
};
