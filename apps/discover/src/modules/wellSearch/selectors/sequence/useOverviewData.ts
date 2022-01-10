import { useMemo, useState } from 'react';

import flatten from 'lodash/flatten';
import { changeUnits } from 'utils/units';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellInspectSelectedWells } from 'modules/wellInspect/hooks/useWellInspect';
import { useTrajectoriesQuery } from 'modules/wellSearch/hooks/useTrajectoriesQuery';
import { convertToFixedDecimal } from 'modules/wellSearch/utils';
import { OverviewModel } from 'pages/authorized/search/well/inspect/modules/overview/types';

const getUnitChangeAccessors = (unit: string) => [
  {
    accessor: 'waterDepth.value',
    fromAccessor: 'waterDepth.unit',
    to: unit,
  },
  {
    accessor: 'md',
    fromAccessor: 'mdUnit',
    to: unit,
  },
  {
    accessor: 'tvd',
    fromAccessor: 'tvdUnit',
    to: unit,
  },
];

export const useOverviewData = () => {
  const wells = useWellInspectSelectedWells();
  const userPreferredUnit = useUserPreferencesMeasurement();
  const { trajectories, isLoading } = useTrajectoriesQuery();
  const [accessorsToFixedDecimal] = useState(['waterDepth.value', 'tvd', 'md']);

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
            overView.mdUnit = trajectory.metadata?.bh_md_unit;
            overView.tvd = trajectory.metadata?.bh_tvd;
            overView.tvdUnit = trajectory.metadata?.bh_tvd_unit;
          }

          return convertToFixedDecimal(
            changeUnits(overView, getUnitChangeAccessors(userPreferredUnit)),
            accessorsToFixedDecimal
          );
        })
      )
    );

    return { overviewData, isLoading };
  }, [wells, trajectories, userPreferredUnit]);
};
