/*!
 * Copyright 2024 Cognite AS
 */
import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type ThreeView } from '../../base/views/ThreeView';
import { PointsOfInterestView } from './PointsOfInterestView';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { PointsOfInterestCache } from './PointsOfInterestCache';
import { type PointOfInterest, PointsOfInterestStatus } from './types';
import { partition, remove } from 'lodash';
import {
  type CommentProperties,
  type PointsOfInterestProperties,
  type PointsOfInterestInstance
} from './models';
import { type PointsOfInterestProvider } from './PointsOfInterestProvider';
import { type DmsUniqueIdentifier } from '../../../data-providers';

export class PointsOfInterestDomainObject<PoiIdType> extends VisualDomainObject {
  private _selectedPointsOfInterest: PointOfInterest<PoiIdType> | undefined;
  private readonly _poisCache: PointsOfInterestCache<PoiIdType>;

  /* TODO: get this scene from some central place inside the architecture,
     when available
     Håkon Flatval, 2024-11-27
  */
  private _currentScene: DmsUniqueIdentifier | undefined = undefined;

  private _pointsOfInterest: Array<PointOfInterest<PoiIdType>> = [];

  constructor(poiProvider: PointsOfInterestProvider<PoiIdType>) {
    super();
    this._poisCache = new PointsOfInterestCache<PoiIdType>(poiProvider);
  }

  public override get typeName(): TranslationInput {
    return { untranslated: PointsOfInterestDomainObject.name };
  }

  protected override createThreeView():
    | ThreeView<PointsOfInterestDomainObject<PoiIdType>>
    | undefined {
    return new PointsOfInterestView();
  }

  public override get canBeRemoved(): boolean {
    return false;
  }

  public addPendingPointsOfInterest(
    poiData: PointsOfInterestProperties
  ): PointOfInterest<PoiIdType> {
    const newPointsOfInterest = {
      properties: poiData,
      status: PointsOfInterestStatus.PendingCreation,
      id: this._poisCache.getDataProvider().createNewId()
    };

    this._pointsOfInterest.push(newPointsOfInterest);

    this.notify(Changes.geometry);

    return newPointsOfInterest;
  }

  public removePointsOfInterest(poiToDelete: PointOfInterest<PoiIdType>): void {
    if (poiToDelete.status === PointsOfInterestStatus.PendingCreation) {
      remove(this._pointsOfInterest, (poi) => poiToDelete === poi);
    } else if (this._pointsOfInterest.includes(poiToDelete)) {
      poiToDelete.status = PointsOfInterestStatus.PendingDeletion;
    }

    this.notify(Changes.geometry);
  }

  public get pointsOfInterest(): Array<PointOfInterest<PoiIdType>> {
    return this._pointsOfInterest;
  }

  public get selectedPointsOfInterest(): PointOfInterest<PoiIdType> | undefined {
    return this._selectedPointsOfInterest;
  }

  public async save(): Promise<void> {
    const fdmSdk = this.rootDomainObject?.fdmSdk;
    if (fdmSdk === undefined) {
      return fdmSdk;
    }

    if (
      this._selectedPointsOfInterest !== undefined &&
      (this._selectedPointsOfInterest.status === PointsOfInterestStatus.PendingCreation ||
        this._selectedPointsOfInterest.status === PointsOfInterestStatus.PendingDeletion)
    ) {
      this.setSelectedPointOfInterest(undefined);
    }

    const [toRemove, notToRemove] = partition(
      this._pointsOfInterest,
      (poi) => poi.status === PointsOfInterestStatus.PendingDeletion
    );

    const deletePromise = this._poisCache.deletePointsOfInterest(toRemove.map((poi) => poi.id));

    const poisToCreate = this._pointsOfInterest.filter(
      (obs) => obs.status === PointsOfInterestStatus.PendingCreation
    );

    const newPointsOfInterest = await this._poisCache.upsertPointsOfInterest(poisToCreate);

    this._pointsOfInterest = notToRemove
      .filter((poi) => poi.status === PointsOfInterestStatus.Default)
      .concat(
        newPointsOfInterest.map((poi) => ({
          status: PointsOfInterestStatus.Default,
          properties: poi.properties,
          id: poi.id
        }))
      );

    await deletePromise;

    this.notify(Changes.geometry);
  }

  public setSelectedPointOfInterest(poi: PointOfInterest<PoiIdType> | undefined): void {
    this._selectedPointsOfInterest = poi;

    this.notify(Changes.selected);
  }

  public async updatePointsOfInterest(
    pois: Array<PointOfInterest<PoiIdType>>
  ): Promise<Array<PointsOfInterestInstance<PoiIdType>>> {
    return await this._poisCache.upsertPointsOfInterest(pois);
  }

  public async postCommentForPoi(
    poi: PointOfInterest<PoiIdType>,
    content: string
  ): Promise<CommentProperties | undefined> {
    const comment = await this._poisCache.postCommentForPoi(poi.id, content);
    this.notify(Changes.addedPart);
    return comment;
  }

  public async getCommentsForPoi(poi: PointOfInterest<PoiIdType>): Promise<CommentProperties[]> {
    return await this._poisCache.getPoiCommentsForPoi(poi.id);
  }

  public hasPendingPointsOfInterest(): boolean {
    return this._pointsOfInterest.some(
      (poi) => poi.status === PointsOfInterestStatus.PendingCreation
    );
  }

  public hasPendingDeletionPointsOfInterest(): boolean {
    return this._pointsOfInterest.some(
      (pois) => pois.status === PointsOfInterestStatus.PendingDeletion
    );
  }

  public getScene(): DmsUniqueIdentifier | undefined {
    return this._currentScene;
  }

  public async setCurrentScene(scene: DmsUniqueIdentifier | undefined): Promise<void> {
    if (scene === this._currentScene) {
      return;
    }

    this._currentScene = scene;
    this._pointsOfInterest = [];

    if (scene === undefined) {
      return;
    }

    const newPois = await this._poisCache.fetchPoisForScene(scene);
    this._pointsOfInterest = newPois.map((poi) => ({
      id: poi.id,
      properties: poi.properties,
      status: PointsOfInterestStatus.Default
    }));

    this.notify(Changes.geometry);
  }
}
