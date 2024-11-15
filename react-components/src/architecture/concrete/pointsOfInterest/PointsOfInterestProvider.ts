/*!
 * Copyright 2024 Cognite AS
 */
import {
  type CommentProperties,
  type PointsOfInterestInstance,
  type PointsOfInterestProperties
} from './models';

export type PointsOfInterestProvider<ID> = {
  createPointsOfInterest: (
    pois: { id: ID; properties: PointsOfInterestProperties }[]
  ) => Promise<Array<PointsOfInterestInstance<ID>>>;
  fetchAllPointsOfInterest: () => Promise<Array<PointsOfInterestInstance<ID>>>;
  getPointsOfInterestComments: (poiId: ID) => Promise<CommentProperties[]>;
  postPointsOfInterestComment: (poiId: ID, content: string) => Promise<CommentProperties>;
  deletePointsOfInterest: (poiIds: ID[]) => Promise<void>;
  createNewId(): ID;
};
