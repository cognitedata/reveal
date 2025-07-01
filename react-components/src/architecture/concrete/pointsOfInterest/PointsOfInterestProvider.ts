import { type DmsUniqueIdentifier } from '../../../data-providers';
import {
  type CommentProperties,
  type PointsOfInterestInstance,
  type PointsOfInterestProperties
} from './models';

export type PointsOfInterestProvider<ID> = {
  upsertPointsOfInterest: (
    pois: Array<{ id: ID; properties: PointsOfInterestProperties }>
  ) => Promise<Array<PointsOfInterestInstance<ID>>>;
  fetchPointsOfInterest: (
    scene?: DmsUniqueIdentifier
  ) => Promise<Array<PointsOfInterestInstance<ID>>>;
  getPointsOfInterestComments: (poiId: ID) => Promise<CommentProperties[]>;
  postPointsOfInterestComment: (poiId: ID, content: string) => Promise<CommentProperties>;
  deletePointsOfInterest: (poiIds: ID[]) => Promise<void>;
  createNewId: () => ID;
};
