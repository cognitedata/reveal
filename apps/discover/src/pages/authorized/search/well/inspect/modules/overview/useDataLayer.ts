import { useMemo } from 'react';

import { getMd, getMdUnit } from 'dataLayers/wells/trajectory/selectors/getMd';
import { getTrajectoryForWellbore } from 'dataLayers/wells/trajectory/selectors/getTrajectoryForWellbore';
import {
  getTvd,
  getTvdUnit,
} from 'dataLayers/wells/trajectory/selectors/getTvd';
import { getWaterDepth } from 'dataLayers/wells/wells/selectors/getWaterDepth';
import flatten from 'lodash/flatten';

import { Sequence } from '@cognite/sdk';
import { Trajectory } from '@cognite/sdk-wells-v3';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellInspectSelectedWells } from 'modules/wellInspect/hooks/useWellInspect';
import { useEnabledWellSdkV3 } from 'modules/wellSearch/hooks/useEnabledWellSdkV3';
import { useTrajectoriesMetadataQuery } from 'modules/wellSearch/hooks/useTrajectoriesQuery';
import { OverviewModel } from 'pages/authorized/search/well/inspect/modules/overview/types';

export const useDataLayer = () => {
  const wells = useWellInspectSelectedWells();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const enabledWellSDKV3 = useEnabledWellSdkV3();

  const { data: trajectories, isLoading } =
    useTrajectoriesMetadataQuery(enabledWellSDKV3);

  return useMemo(() => {
    if (isLoading) {
      return { isLoading, overviewData: [] };
    }
    const overviewData = flatten(
      wells.map((well) =>
        well.wellbores.map((wellbore) => {
          const overView: OverviewModel = {
            ...wellbore,
            // this is a special case just for the overview
            wellName: `${well?.name} / ${wellbore?.description}`,
            operator: well.operator,
            spudDate: well.spudDate,
            sources: well.sources ? well.sources.join(', ') : '',
            // this is a special case just for the overview
            field: well.field || wellbore.metadata?.field_name,
            md: '',
            tvd: '',

            waterDepth: getWaterDepth(well, userPreferredUnit),
          };

          if (enabledWellSDKV3) {
            if (trajectories) {
              const trajectory = getTrajectoryForWellbore(
                trajectories as Trajectory[], // remove cast when @sdk-wells-v2 is removed
                wellbore.id
              );

              if (trajectory) {
                overView.md = String(getMd(trajectory, userPreferredUnit));
                overView.mdUnit = getMdUnit();
                overView.tvd = String(getTvd(trajectory, userPreferredUnit));
                overView.tvdUnit = getTvdUnit();
              }
            }
          } else {
            // remove when @sdk-wells-v2 is removed:
            const trajectory = (trajectories as Sequence[]).find(
              (row) => row.assetId === wellbore.id
            );

            if (trajectory) {
              overView.md = trajectory.metadata?.bh_md;
              overView.mdUnit = trajectory.metadata?.bh_md_unit;
              overView.tvd = trajectory.metadata?.bh_tvd;
              overView.tvdUnit = trajectory.metadata?.bh_tvd_unit;
            }
          }

          return overView;
        })
      )
    );

    return { overviewData, isLoading };
  }, [wells, trajectories, userPreferredUnit, isLoading]);
};
