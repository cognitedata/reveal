import { AllCursorsProps } from 'domain/wells/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { handleServiceError } from 'utils/errors';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getDepthMeasurements } from '../../service/network/getDepthMeasurements';
import { MeasurementTypeFilter } from '../../service/types';
import { ERROR_LOADING_DEPTH_MEASUREMENTS_ERROR } from '../constants';
import { normalizeDepthMeasurement } from '../transformers/normalizeDepthMeasurement';
import { DepthMeasurementInternal } from '../types';

export const useDepthMeasurementsQuery = ({
  wellboreIds,
  measurementTypes = [],
}: AllCursorsProps & MeasurementTypeFilter) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useArrayCache<DepthMeasurementInternal>({
    key: [
      ...WELL_QUERY_KEY.DEPTH_MEASUREMENTS,
      ...measurementTypes,
      userPreferredUnit,
    ],
    items: new Set(wellboreIds),
    fetchAction: (wellboreIds, options) =>
      getDepthMeasurements({ wellboreIds, measurementTypes, options })
        .then((depthMeasurements) =>
          depthMeasurements.map((rawDepthMeasurement) =>
            normalizeDepthMeasurement(rawDepthMeasurement, userPreferredUnit)
          )
        )
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_DEPTH_MEASUREMENTS_ERROR)
        ),
  });
};
