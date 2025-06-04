import { type DmsUniqueIdentifier } from '../../../data-providers';
import { type CommentProperties, type PointsOfInterestInstance } from './models';
import { type PointsOfInterestProvider } from './PointsOfInterestProvider';

/**
 * A cache that takes care of loading the pois, but also buffers changes to the overlays
 * list when e.g. adding or removing pois
 */
export class PointsOfInterestCache<PoiId> {
  private readonly _poiProvider: PointsOfInterestProvider<PoiId>;

  private readonly _poiCommentCache = new Map<string, CommentProperties[]>();

  constructor(poiProvider: PointsOfInterestProvider<PoiId>) {
    this._poiProvider = poiProvider;
  }

  public async getPoiCommentsForPoi(id: PoiId): Promise<CommentProperties[]> {
    const hashKey = createHashKey(id);

    const cacheElement = this._poiCommentCache.get(hashKey);

    if (cacheElement !== undefined) {
      return cacheElement;
    }

    const comments = await this._poiProvider.getPointsOfInterestComments(id);
    this._poiCommentCache.set(hashKey, comments);

    return comments;
  }

  public async postCommentForPoi(id: PoiId, content: string): Promise<CommentProperties> {
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

  public async fetchPoisForScene(
    sceneId: DmsUniqueIdentifier
  ): Promise<Array<PointsOfInterestInstance<PoiId>>> {
    return await this._poiProvider.fetchPointsOfInterest(sceneId);
  }

  public async deletePointsOfInterest(poiIds: PoiId[]): Promise<void> {
    if (poiIds.length === 0) {
      return;
    }

    await this._poiProvider.deletePointsOfInterest(poiIds);
  }

  public async upsertPointsOfInterest(
    pois: Array<PointsOfInterestInstance<PoiId>>
  ): Promise<Array<PointsOfInterestInstance<PoiId>>> {
    if (pois.length === 0) {
      return [];
    }

    return await this._poiProvider.upsertPointsOfInterest(pois);
  }

  public getDataProvider(): PointsOfInterestProvider<PoiId> {
    return this._poiProvider;
  }
}

function createHashKey(id: any): string {
  if (typeof id === 'string') {
    return id;
  }

  return JSON.stringify(id);
}
