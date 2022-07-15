import { AllCursorsProps } from 'domain/wells/types';

import { useMemo } from 'react';

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
    isLoading: isDepthMeasurementsLoading,
  } = useDepthMeasurementsQuery({ wellboreIds, measurementTypes });

  const sequenceExternalIds = useMemo(
    () => depthMeasurements.map(({ source }) => source.sequenceExternalId),
    [depthMeasurements]
  );

  const {
    data: depthMeasurementData = [],
    isLoading: isDepthMeasurementDataLoading,
  } = useDepthMeasurementDataQuery({
    sequenceExternalIds,
    /**
     * There is a doubt if we should or shouldn't send the measurementTypes for this request body.
     * Commenting this out as a quick fix.
     * This should be confirmed and fixed as soon as possible.
     * TODO(PP-3071)
     */
    // measurementTypes,
  });

  const isLoading = isDepthMeasurementsLoading || isDepthMeasurementDataLoading;

  const depthMeasurementWithData = useMemo(() => {
    if (isLoading) {
      return [];
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
