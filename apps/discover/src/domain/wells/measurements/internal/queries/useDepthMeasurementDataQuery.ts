import { groupBySequence } from 'domain/wells/wellbore/internal/transformers/groupBySequence';

import { handleServiceError } from 'utils/errors';
import { toDistanceUnitEnum } from 'utils/units/toDistanceUnitEnum';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getDepthMeasurementData } from '../../service/network/getDepthMeasurementData';
import {
  MeasurementTypeFilter,
  SequenceExternalIdFilter,
} from '../../service/types';
import { ERROR_LOADING_DEPTH_MEASUREMENT_DATA_ERROR } from '../constants';
import { normalizeDepthMeasurementData } from '../transformers/normalizeDepthMeasurementData';
import { DepthMeasurementDataInternal } from '../types';

export const useDepthMeasurementDataQuery = ({
  sequenceExternalIds,
  measurementTypes,
}: SequenceExternalIdFilter & MeasurementTypeFilter) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useArrayCache<DepthMeasurementDataInternal>({
    key: [
      ...WELL_QUERY_KEY.DEPTH_MEASUREMENT_DATA,
      ...(measurementTypes || []),
      userPreferredUnit,
    ],
    items: new Set(sequenceExternalIds),
    fetchAction: (sequenceExternalIds, options) =>
      getDepthMeasurementData({
        sequenceExternalIds,
        measurementTypes,
        unit: toDistanceUnitEnum(userPreferredUnit),
        options,
      })
        .then((depthMeasurementData) =>
          depthMeasurementData.map((rawDepthMeasurementData) =>
            normalizeDepthMeasurementData(rawDepthMeasurementData)
          )
        )
        .then(groupBySequence)
        .catch((error) =>
          handleServiceError(
            error,
            {},
            ERROR_LOADING_DEPTH_MEASUREMENT_DATA_ERROR
          )
        ),
  });
};
