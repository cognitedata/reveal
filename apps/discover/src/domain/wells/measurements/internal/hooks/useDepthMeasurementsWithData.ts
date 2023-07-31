import { AllCursorsProps } from 'domain/wells/types';

import { useMemo } from 'react';

import { EMPTY_ARRAY } from 'constants/empty';

import { MeasurementTypeFilter } from '../../service/types';
import { useDepthMeasurementDataQuery } from '../queries/useDepthMeasurementDataQuery';
import { useDepthMeasurementsQuery } from '../queries/useDepthMeasurementsQuery';
import { mergeDepthMeasurementsAndData } from '../transformers/mergeDepthMeasurementsAndData';

export const useDepthMeasurementsWithData = ({
  wellboreIds,
  measurementTypes,
}: AllCursorsProps & MeasurementTypeFilter) => {
  const {
    data: depthMeasurements = [],
    isInitialLoading: isDepthMeasurementsLoading,
  } = useDepthMeasurementsQuery({ wellboreIds, measurementTypes });

  const sequenceExternalIds = useMemo(
    () => depthMeasurements.map(({ source }) => source.sequenceExternalId),
    [depthMeasurements]
  );

  const {
    data: depthMeasurementData = [],
    isInitialLoading: isDepthMeasurementDataLoading,
  } = useDepthMeasurementDataQuery({ sequenceExternalIds, measurementTypes });

  const isLoading = isDepthMeasurementsLoading || isDepthMeasurementDataLoading;

  const depthMeasurementWithData = useMemo(() => {
    if (isLoading) {
      return EMPTY_ARRAY;
    }

    return mergeDepthMeasurementsAndData(
      depthMeasurements,
      depthMeasurementData
    );
  }, [isLoading, depthMeasurements, depthMeasurementData]);

  return {
    data: depthMeasurementWithData,
    isLoading,
  };
};
