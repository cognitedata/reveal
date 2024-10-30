/*!
 * Copyright 2024 Cognite AS
 */
import { type PointsOfInterestInstance, type PointsOfInterestProperties } from './models';

export type PointsOfInterestProvider<ID> = {
  createPointsOfInterest: (
    pois: PointsOfInterestProperties[]
  ) => Promise<Array<PointsOfInterestInstance<ID>>>;
  fetchAllPointsOfInterest: () => Promise<Array<PointsOfInterestInstance<ID>>>;
  deletePointsOfInterest: (poiIds: ID[]) => Promise<void>;
};
