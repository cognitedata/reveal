import { useTrajectoriesQuery } from 'domain/wells/trajectory/internal/queries/useTrajectoriesQuery';
import { useWellInspectSelectedWells } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWells';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';

import { useMemo } from 'react';

import flatten from 'lodash/flatten';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/selectors';
import { OverviewModel } from 'pages/authorized/search/well/inspect/modules/overview/types';

export const useDataLayer = () => {
  const wells = useWellInspectSelectedWells();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const wellboreIds = useWellInspectSelectedWellboreIds();
  const { data: trajectories = [], isLoading } = useTrajectoriesQuery({
    wellboreIds,
  });

  const keyedTrajectories = useMemo(
    () => keyByWellbore(trajectories),
    [trajectories]
  );

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
            field: well.field,
            md: '',
            tvd: '',

            waterDepth: well.waterDepth,
          };

          const trajectory = keyedTrajectories[wellbore.matchingId];

          if (trajectory) {
            const { maxMeasuredDepth, maxTrueVerticalDepth } = trajectory;

            overView.md = String(maxMeasuredDepth);
            overView.mdUnit = userPreferredUnit;
            overView.tvd = String(maxTrueVerticalDepth);
            overView.tvdUnit = userPreferredUnit;
          }

          return overView;
        })
      )
    );

    return { overviewData, isLoading };
  }, [wells, trajectories, userPreferredUnit, isLoading]);
};
