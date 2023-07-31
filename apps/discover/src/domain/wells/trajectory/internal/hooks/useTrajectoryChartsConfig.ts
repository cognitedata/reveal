import { ProjectConfigWellsTrajectoryCharts } from '@cognite/discover-api-types';

import { useDeepMemo } from 'hooks/useDeep';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';

export const useTrajectoryChartsConfig =
  (): ProjectConfigWellsTrajectoryCharts[] => {
    const { data: config } = useWellConfig();

    return useDeepMemo(
      () => config?.trajectory?.charts || [],
      [config?.trajectory?.charts]
    );
  };
