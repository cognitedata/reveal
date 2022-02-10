import { useMemo } from 'react';

import flatten from 'lodash/flatten';
import { changeUnits } from 'utils/units';

import { Sequence } from '@cognite/sdk';
import { Trajectory } from '@cognite/sdk-wells-v3/dist/src';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellInspectSelectedWells } from 'modules/wellInspect/hooks/useWellInspect';
import { useEnabledWellSdkV3 } from 'modules/wellSearch/hooks/useEnabledWellSdkV3';
import { useTrajectoriesMetadataQuery } from 'modules/wellSearch/hooks/useTrajectoriesQuery';
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

const accessorsToFixedDecimal = ['waterDepth.value', 'tvd', 'md'];

export const useOverviewData = () => {
  const wells = useWellInspectSelectedWells();
  const userPreferredUnit = useUserPreferencesMeasurement();

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
            wellName: `${well.description} / ${wellbore.description}`,
            operator: well.operator,
            spudDate: well.spudDate,
            waterDepth: well.waterDepth,
            sources: well.sources,
            field: well.field || wellbore.metadata?.field_name,
          };

          if (enabledWellSDKV3) {
            const trajectory = (trajectories as Trajectory[])?.find(
              (row) => row.wellboreMatchingId === wellbore.id
            );

            if (trajectory) {
              overView.md = String(trajectory.maxMeasuredDepth);
              overView.mdUnit = 'meter';
              overView.tvd = String(trajectory.maxTrueVerticalDepth);
              overView.tvdUnit = 'meter';
            }
          } else {
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

          const transformedOverview = changeUnits(
            overView,
            getUnitChangeAccessors(userPreferredUnit)
          );

          return convertToFixedDecimal(
            transformedOverview,
            accessorsToFixedDecimal
          );
        })
      )
    );

    return { overviewData, isLoading };
  }, [wells, trajectories, userPreferredUnit, isLoading]);
};
