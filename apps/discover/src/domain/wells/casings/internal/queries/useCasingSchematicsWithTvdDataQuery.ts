import { AllCursorsProps } from 'domain/wells/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { handleServiceError } from 'utils/errors';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getCasingSchematicsWithTvd } from '../../service/network/getCasingSchematicsWithTvd';
import { ERROR_LOADING_CASING_SCHEMATICS_ERROR } from '../constants';
import { normalizeCasingSchematicWithTvd } from '../transformers/normalizeCasingSchematicWithTvd';
import { CasingSchematicInternalWithTvd } from '../types';

export const useCasingSchematicsWithTvdDataQuery = ({
  wellboreIds,
}: AllCursorsProps) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useArrayCache<CasingSchematicInternalWithTvd>({
    key: [...WELL_QUERY_KEY.CASINGS_WITH_TVD_CACHE, userPreferredUnit],
    items: new Set(wellboreIds),
    fetchAction: (wellboreIds, options) =>
      getCasingSchematicsWithTvd({ wellboreIds, options })
        .then((casingSchematics) =>
          casingSchematics.map((rawCasingSchematic) =>
            normalizeCasingSchematicWithTvd(
              rawCasingSchematic,
              userPreferredUnit
            )
          )
        )
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_CASING_SCHEMATICS_ERROR)
        ),
  });
};
