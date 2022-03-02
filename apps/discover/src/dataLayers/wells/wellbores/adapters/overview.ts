import { Well, Wellbore } from '@cognite/sdk-wells-v2';

import { OverviewModel } from 'pages/authorized/search/well/inspect/modules/overview/types';

export const overviewAdapter = (
  well: Well,
  wellbore: Wellbore
): OverviewModel => {
  const overView: OverviewModel = {
    ...wellbore,
    wellName: `${well.description} / ${wellbore.description}`,
    operator: well.operator,
    spudDate: '',
    // spudDate: well.spudDate,
    waterDepth: well.waterDepth,
    sources: well.sources,
    field: well.field,
  };

  return overView;

  //   if (enabledWellSDKV3) {
  //     const trajectory = (trajectories as Trajectory[])?.find(
  //       (row) => row.wellboreMatchingId === wellbore.id
  //     );

  //     if (trajectory) {
  //       overView.md = String(trajectory.maxMeasuredDepth);
  //       overView.mdUnit = 'meter';
  //       overView.tvd = String(trajectory.maxTrueVerticalDepth);
  //       overView.tvdUnit = 'meter';
  //     }
  //   } else {
  //     const trajectory = (trajectories as Sequence[]).find(
  //       (row) => row.assetId === wellbore.id
  //     );

  //     if (trajectory) {
  //       overView.md = trajectory.metadata?.bh_md;
  //       overView.mdUnit = trajectory.metadata?.bh_md_unit;
  //       overView.tvd = trajectory.metadata?.bh_tvd;
  //       overView.tvdUnit = trajectory.metadata?.bh_tvd_unit;
  //     }
  //   }

  //   const transformedOverview = changeUnits(
  //     overView,
  //     getUnitChangeAccessors(userPreferredUnit)
  //   );

  //   return convertToFixedDecimal(
  //     transformedOverview,
  //     accessorsToFixedDecimal
  //   );
};
