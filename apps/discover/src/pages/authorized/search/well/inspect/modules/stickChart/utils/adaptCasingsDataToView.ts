import { sortCasingAssembliesByMDBase } from 'domain/wells/casings/internal/transformers/sortCasingAssembliesByMDBase';
import { CasingSchematicInternal } from 'domain/wells/casings/internal/types';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { NdsInternal } from 'domain/wells/nds/internal/types';
import { NptInternal } from 'domain/wells/npt/internal/types';
import {
  KeyedTvdData,
  TrajectoryWithData,
} from 'domain/wells/trajectory/internal/types';
import { WellInternal } from 'domain/wells/well/internal/types';
import { getRkbLevel } from 'domain/wells/wellbore/internal/selectors/getRkbLevel';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';
import { WellTopsInternal } from 'domain/wells/wellTops/internal/types';

import isUndefined from 'lodash/isUndefined';

import { CasingSchematicView } from '../types';

import { adaptCasingAssembliesDataToView } from './adaptCasingAssembliesDataToView';
import { getEmptyCasingSchematicView } from './getEmptyCasingSchematicView';

export const adaptCasingsDataToView = (
  wells: WellInternal[],
  casingsData: CasingSchematicInternal[],
  tvdData: KeyedTvdData,
  nptData: Record<string, NptInternal[]>,
  ndsData: Record<string, NdsInternal[]>,
  wellTops: WellTopsInternal[],
  trajectoriesData: TrajectoryWithData[],
  measurementsData: DepthMeasurementWithData[]
): CasingSchematicView[] => {
  const keyedCasingsData = keyByWellbore(casingsData);
  const keyedMeasurementsData = keyByWellbore(measurementsData);
  const keyedTrajectoriesData = keyByWellbore(trajectoriesData);

  return wells.flatMap((well) =>
    (well.wellbores || []).map((wellbore) => {
      const {
        matchingId: wellboreMatchingId,
        name: wellboreName,
        color: wellboreColor,
      } = wellbore;

      const casingSchematic = keyedCasingsData[wellboreMatchingId];
      const trueVerticalDepths = tvdData[wellboreMatchingId];

      const wellTop = wellTops.find(
        (top) => top.wellboreMatchingId === wellboreMatchingId
      );
      // If no casings for the current wellbore.
      if (isUndefined(casingSchematic)) {
        return getEmptyCasingSchematicView(wellbore, wellTop);
      }

      const casingAssemblies = adaptCasingAssembliesDataToView(
        casingSchematic.casingAssemblies,
        trueVerticalDepths
      );

      return {
        ...casingSchematic,
        casingAssemblies: sortCasingAssembliesByMDBase(casingAssemblies),
        wellName: well.name,
        wellboreName,
        wellboreColor,
        rkbLevel: getRkbLevel(wellbore),
        waterDepth: well.waterDepth,
        nptEvents: nptData[wellboreMatchingId] || [],
        ndsEvents: ndsData[wellboreMatchingId] || [],
        wellTop,
        measurementsData: keyedMeasurementsData[wellboreMatchingId],
        trajectoriesData: keyedTrajectoriesData[wellboreMatchingId] || [],
      };
    })
  );
};
