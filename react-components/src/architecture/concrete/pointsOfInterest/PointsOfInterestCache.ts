/*!
 * Copyright 2024 Cognite AS
 */
import {
  CommentProperties,
  type PointsOfInterestInstance,
  type PointsOfInterestProperties
} from './models';
import { type PointsOfInterestProvider } from './PointsOfInterestProvider';

/**
 * A cache that takes care of loading the pois, but also buffers changes to the overlays
 * list when e.g. adding or removing pois
 */
export class PointsOfInterestCache<PoIId> {
  private readonly _loadedPromise: Promise<Array<PointsOfInterestInstance<PoIId>>>;
  private readonly _poiProvider: PointsOfInterestProvider<PoIId>;

  private readonly _poiCommentCache: Map<string, CommentProperties[]> = new Map();

  constructor(poiProvider: PointsOfInterestProvider<PoIId>) {
    this._poiProvider = poiProvider;
    this._loadedPromise = poiProvider.fetchAllPointsOfInterest();
  }

  public async getPoiCommentsForPoi(id: PoIId): Promise<CommentProperties[]> {
    const hashKey = createHashKey(id);

    const cacheElement = this._poiCommentCache.get(hashKey);

    if (cacheElement !== undefined) {
      return cacheElement;
    }

    const comments = await this._poiProvider.getPointsOfInterestComments(id);
    this._poiCommentCache.set(hashKey, comments);

    return comments;
  }

  public async postCommentForPoi(id: PoIId, content: string): Promise<CommentProperties> {
    const comment = await this._poiProvider.postPointsOfInterestComment(id, content);

    const hashKey = createHashKey(id);
    const cacheElement = this._poiCommentCache.get(hashKey);

    if (cacheElement !== undefined) {
      cacheElement.push(comment);
    } else {
      this._poiCommentCache.set(hashKey, [comment]);
    }

    return comment;
  }

  public async getFinishedOriginalLoadingPromise(): Promise<
    Array<PointsOfInterestInstance<PoIId>>
  > {
    const points = await this._loadedPromise;
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

function createHashKey(id: any): string {
  if (typeof id === 'string') {
    return id;
  }

  return JSON.stringify(id);
}
