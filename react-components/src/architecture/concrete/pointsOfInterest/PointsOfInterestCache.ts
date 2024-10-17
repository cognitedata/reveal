/*!
 * Copyright 2024 Cognite AS
 */
import { type PointsOfInterestInstance, type PointsOfInterestProperties } from './models';
import { type PointsOfInterestProvider } from './PointsOfInterestProvider';

/**
 * A cache that takes care of loading the pois, but also buffers changes to the overlays
 * list when e.g. adding or removing pois
 */
export class PointsOfInterestCache<PoIId> {
  private readonly _loadedPromise: Promise<Array<PointsOfInterestInstance<PoIId>>>;
  private readonly _poiProvider: PointsOfInterestProvider<PoIId>;

  constructor(poiProvider: PointsOfInterestProvider<PoIId>) {
    this._poiProvider = poiProvider;
    this._loadedPromise = poiProvider.fetchAllPointsOfInterest();
  }

  public async getFinishedOriginalLoadingPromise(): Promise<
    Array<PointsOfInterestInstance<PoIId>>
  > {
    return await this._loadedPromise;
  }

  public async deletePointsOfInterest(poiIds: PoIId[]): Promise<void> {
    if (poiIds.length === 0) {
      return;
    }

    await this._poiProvider.deletePointsOfInterest(poiIds);
  }

  public async savePointsOfInterest(
    pois: PointsOfInterestProperties[]
  ): Promise<Array<PointsOfInterestInstance<PoIId>>> {
    if (pois.length === 0) {
      return [];
    }

    return await this._poiProvider.createPointsOfInterest(pois);
  }
}
