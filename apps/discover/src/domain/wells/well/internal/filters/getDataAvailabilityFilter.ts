import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';

import { WellFilter } from '@cognite/sdk-wells';

export enum DataAvailabilityOptions {
  'Trajectories' = 'Trajectories',
  'NDS' = 'NDS events',
  'NPT' = 'NPT events',
  'Casings' = 'Casings',
}

export const getDataAvailabilityFilter = (enabled: unknown): WellFilter => {
  if (isEmpty(enabled) || !isArray(enabled)) {
    return {};
  }
  const verifiedData = enabled as DataAvailabilityOptions[];

  const dataAvailabilityFilters: WellFilter = {};

  if (verifiedData.includes(DataAvailabilityOptions.Casings)) {
    dataAvailabilityFilters.casings = {
      exists: true,
    };
  }
  if (verifiedData.includes(DataAvailabilityOptions.Trajectories)) {
    dataAvailabilityFilters.trajectories = {};
  }
  if (verifiedData.includes(DataAvailabilityOptions.NDS)) {
    dataAvailabilityFilters.nds = {
      exists: true,
    };
  }
  if (verifiedData.includes(DataAvailabilityOptions.NPT)) {
    dataAvailabilityFilters.npt = {
      exists: true,
    };
  }

  return dataAvailabilityFilters;
};
