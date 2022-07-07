import { SequenceDataError } from 'domain/wells/types';
import { groupBySequence } from 'domain/wells/wellbore/internal/transformers/groupBySequence';

import { toDistanceUnitEnum } from 'utils/units/toDistanceUnitEnum';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getDepthMeasurementData } from '../../service/network/getDepthMeasurementData';
import {
  MeasurementTypeFilter,
  SequenceExternalIdFilter,
} from '../../service/types';
import { handleDepthMeasurementDataServiceError } from '../../service/utils/handleDepthMeasurementDataServiceError';
import { normalizeDepthMeasurementData } from '../transformers/normalizeDepthMeasurementData';
import { DepthMeasurementDataInternal } from '../types';

export const useDepthMeasurementDataQuery = ({
  sequenceExternalIds,
  measurementTypes = [],
}: SequenceExternalIdFilter & MeasurementTypeFilter) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useArrayCache<DepthMeasurementDataInternal | SequenceDataError>({
    key: [
      ...WELL_QUERY_KEY.DEPTH_MEASUREMENTS_DATA,
      ...measurementTypes,
      userPreferredUnit,
    ],
    items: new Set(sequenceExternalIds),
    fetchAction: (sequenceExternalIds, options) =>
      Promise.all(
        Array.from(sequenceExternalIds).map((sequenceExternalId) =>
          getDepthMeasurementData({
            sequenceExternalId,
            measurementTypes,
            unit: toDistanceUnitEnum(userPreferredUnit),
            options,
          })
            .then(normalizeDepthMeasurementData)
            .catch((error) =>
              handleDepthMeasurementDataServiceError(error, sequenceExternalId)
            )
        )
      ).then(groupBySequence),
  });
};
