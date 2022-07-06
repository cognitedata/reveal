import { AllCursorsProps } from 'domain/wells/types';

import flatten from 'lodash/flatten';

import { WELL_LOGS_MEASUREMENT_TYPES } from '../constants';

import { useDepthMeasurementsWithData } from './useDepthMeasurementsWithData';

const measurementTypes = flatten(Object.values(WELL_LOGS_MEASUREMENT_TYPES));

export const useDepthMeasurementsForWellLogs = ({
  wellboreIds,
}: AllCursorsProps) => {
  return useDepthMeasurementsWithData({ wellboreIds, measurementTypes });
};
