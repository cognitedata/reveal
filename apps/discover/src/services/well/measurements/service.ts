import { WdlMeasurementType } from 'modules/wellSearch/types';

import {
  fetchAllDepthMeasurements,
  fetchAllDepthMeasurementData,
} from './measurementsfetchAll';

export const getDepthMeasurements = (
  wellboreMatchingIds: string[],
  measurementTypes: WdlMeasurementType[]
) => fetchAllDepthMeasurements({ wellboreMatchingIds, measurementTypes });

export const getDepthMeasurementData = (sequenceExternalId: string) =>
  fetchAllDepthMeasurementData({ sequenceExternalId });
