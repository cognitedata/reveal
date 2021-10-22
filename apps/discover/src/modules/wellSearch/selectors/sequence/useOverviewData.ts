import { useMemo, useState } from 'react';

import flatten from 'lodash/flatten';

import { changeUnits } from '_helpers/units/utils';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreference';
import { useTrajectoriesQuery } from 'modules/wellSearch/hooks/useTrajectoriesQuery';
import { useSecondarySelectedOrHoveredWells } from 'modules/wellSearch/selectors';
import { convertToFixedDecimal } from 'modules/wellSearch/utils';
import { OverviewModel } from 'pages/authorized/search/well/inspect/modules/overview/types';

export const useOverviewData = () => {
  const wells = useSecondarySelectedOrHoveredWells();
  const userPreferredUnit = useUserPreferencesMeasurement();
  const { trajectories, isLoading } = useTrajectoriesQuery();
  const [accessorsToFixedDecimal] = useState(['waterDepth.value', 'tvd', 'md']);

  const [unitChangeAcceessors] = useState([
    {
      accessor: 'waterDepth.value',
      fromAccessor: 'waterDepth.unit',
      to: userPreferredUnit,
    },
  ]);

  return useMemo(() => {
    const overviewData = flatten(
      wells.map((well) =>
        well.wellbores.map((wellbore) => {
          const overView: OverviewModel = {
            ...wellbore,
            wellName: `${well.description} / ${wellbore.description}`,
            operator: well.operator,
            spudDate: well.spudDate,
            waterDepth: well.waterDepth,
            sources: well.sources,
            field: well.field || wellbore.metadata?.field_name,
          };

          const trajectory = trajectories.find(
            (row) => row.assetId === wellbore.id
          );

          if (trajectory) {
            overView.md = trajectory.metadata?.bh_md;
            overView.tvd = trajectory.metadata?.bh_tvd;
          }

          return convertToFixedDecimal(
            changeUnits(overView, unitChangeAcceessors),
            accessorsToFixedDecimal
          );
        })
      )
    );

    return { overviewData, isLoading };
  }, [wells, trajectories]);
};
