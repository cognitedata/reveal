import invert from 'lodash/invert';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';

import { WellDataAvailabilityFilterEnum, WellFilter } from '@cognite/sdk-wells';

import { DataAvailabilityOptions } from '../types';

export const DATA_AVAILABILITY_OPTIONS: Record<
  DataAvailabilityOptions,
  WellDataAvailabilityFilterEnum
> = {
  NPT: 'npt',
  NDS: 'nds',
  Trajectories: 'trajectories',
  DepthMeasurements: 'depthMeasurements',
  Casings: 'casings',
  HoleSections: 'holeSections',
  TimeMeasurements: 'timeMeasurements',
  WellTops: 'wellTops',
};

export const DATA_AVAILABILITY_OPTIONS_LABELS: Record<
  DataAvailabilityOptions,
  string
> = {
  NPT: 'NPT events',
  NDS: 'NDS events',
  Trajectories: 'Trajectories',
  DepthMeasurements: 'Depth Measurements',
  Casings: 'Casings',
  HoleSections: 'Hole Sections',
  TimeMeasurements: 'Time Measurements',
  WellTops: 'Well Tops',
};

export const DATA_AVAILABILITY_OPTIONS_LABELS_INVERT = invert(
  DATA_AVAILABILITY_OPTIONS_LABELS
) as Record<string, DataAvailabilityOptions>;

export const getDataAvailabilityFilter = (values: unknown): WellFilter => {
  if (isEmpty(values) || !isArray(values)) {
    return {};
  }

  const verifiedData = values.map((value) => {
    const option = DATA_AVAILABILITY_OPTIONS_LABELS_INVERT[value];
    return DATA_AVAILABILITY_OPTIONS[option];
  });

  return {
    dataAvailability: verifiedData,
  };
};
