/*!
 * Copyright 2024 Cognite AS
 */
import {
  CommentProperties,
  type PointsOfInterestInstance,
  type PointsOfInterestProperties
} from './models';

export type PointsOfInterestProvider<ID> = {
  createPointsOfInterest: (
    pois: PointsOfInterestProperties[]
  ) => Promise<Array<PointsOfInterestInstance<ID>>>;
  fetchAllPointsOfInterest: () => Promise<Array<PointsOfInterestInstance<ID>>>;
  getPointsOfInterestComments: (poiId: ID) => Promise<Array<CommentProperties>>;
  postPointsOfInterestComment: (poiId: ID, content: string) => Promise<CommentProperties>;
  deletePointsOfInterest: (poiIds: ID[]) => Promise<void>;
};
