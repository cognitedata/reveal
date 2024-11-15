/*!
 * Copyright 2024 Cognite AS
 */
import { type DmsUniqueIdentifier, type FdmSDK } from '../../../../data-providers/FdmSDK';
import {
  type CommentProperties,
  type PointsOfInterestInstance,
  type PointsOfInterestProperties
} from '../models';
import { type PointsOfInterestProvider } from '../PointsOfInterestProvider';
import {
  createPointsOfInterestInstances,
  deletePointsOfInterestInstances,
  fetchPointsOfInterest
} from './network';

export class PointsOfInterestFdmProvider implements PointsOfInterestProvider<DmsUniqueIdentifier> {
  constructor(private readonly _fdmSdk: FdmSDK) {}

  async createPointsOfInterest(
    pois: PointsOfInterestProperties[]
  ): Promise<Array<PointsOfInterestInstance<DmsUniqueIdentifier>>> {
    return await createPointsOfInterestInstances(this._fdmSdk, pois);
  }

  async fetchAllPointsOfInterest(): Promise<Array<PointsOfInterestInstance<DmsUniqueIdentifier>>> {
    return await fetchPointsOfInterest(this._fdmSdk);
  }

  async deletePointsOfInterest(ids: DmsUniqueIdentifier[]): Promise<void> {
    await deletePointsOfInterestInstances(this._fdmSdk, ids);
  }

  async getPointsOfInterestComments(_poiId: DmsUniqueIdentifier): Promise<CommentProperties[]> {
    return await Promise.resolve([]);
  }

  async postPointsOfInterestComment(
    _poiId: DmsUniqueIdentifier,
    content: string
  ): Promise<CommentProperties> {
    return await Promise.resolve({ ownerId: 'dummy', content });
  }
}
