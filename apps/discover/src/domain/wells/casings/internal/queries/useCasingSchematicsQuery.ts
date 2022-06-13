import { AllCursorsProps } from 'domain/wells/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { handleServiceError } from 'utils/errors';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getCasingSchematics } from '../../service/network/getCasingSchematics';
import { ERROR_LOADING_CASING_SCHEMATICS_ERROR } from '../constants';
import { normalizeCasingSchematic } from '../transformers/normalizeCasingSchematic';
import { CasingSchematicInternal } from '../types';

export const useCasingSchematicsQuery = ({ wellboreIds }: AllCursorsProps) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useArrayCache<CasingSchematicInternal>({
    key: [...WELL_QUERY_KEY.CASINGS_CACHE, userPreferredUnit],
    items: new Set(wellboreIds),
    fetchAction: (wellboreIds, options) =>
      getCasingSchematics({ wellboreIds, options })
        .then((casingSchematics) =>
          casingSchematics.map((rawCasingSchematic) =>
            normalizeCasingSchematic(rawCasingSchematic, userPreferredUnit)
          )
        )
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_CASING_SCHEMATICS_ERROR)
        ),
  });
};
