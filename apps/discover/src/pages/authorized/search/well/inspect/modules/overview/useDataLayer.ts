import { useTrajectoriesMetadataQuery } from 'domain/wells/trajectory/internal/queries/useTrajectoriesMetadataQuery';
import { useWellInspectSelectedWells } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWells';

import { useMemo } from 'react';

import { getMd, getMdUnit } from 'dataLayers/wells/trajectory/selectors/getMd';
import { getTrajectoryForWellbore } from 'dataLayers/wells/trajectory/selectors/getTrajectoryForWellbore';
import {
  getTvd,
  getTvdUnit,
} from 'dataLayers/wells/trajectory/selectors/getTvd';
import { getWaterDepth } from 'dataLayers/wells/wells/selectors/getWaterDepth';
import flatten from 'lodash/flatten';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { OverviewModel } from 'pages/authorized/search/well/inspect/modules/overview/types';

export const useDataLayer = () => {
  const wells = useWellInspectSelectedWells();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const { data: trajectories, isLoading } = useTrajectoriesMetadataQuery();

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
            sources: well.sourceList,
            // this is a special case just for the overview
            field: well.field || wellbore.metadata?.field_name,
            md: '',
            tvd: '',

            waterDepth: getWaterDepth(well, userPreferredUnit),
          };

          if (trajectories) {
            const trajectory = getTrajectoryForWellbore(
              trajectories,
              wellbore.id
            );

            if (trajectory) {
              overView.md = String(getMd(trajectory, userPreferredUnit));
              overView.mdUnit = getMdUnit();
              overView.tvd = String(getTvd(trajectory, userPreferredUnit));
              overView.tvdUnit = getTvdUnit();
            }
          }

          return overView;
        })
      )
    );

    return { overviewData, isLoading };
  }, [wells, trajectories, userPreferredUnit, isLoading]);
};
