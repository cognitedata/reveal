import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';

import { WellFilter } from '@cognite/sdk-wells-v3';

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
  // not sure how to do this for casings yet. need info from sigurd PP-2577
  // if (wellFilters[id].includes(DataAvailabilityOptions.Casings)) {
  //   dataAvailabilityFilters.casings = {};
  // }
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
