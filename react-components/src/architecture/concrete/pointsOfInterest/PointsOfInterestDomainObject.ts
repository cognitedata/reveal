/*!
 * Copyright 2024 Cognite AS
 */
import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type ThreeView } from '../../base/views/ThreeView';
import { PointsOfInterestView } from './PointsOfInterestView';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { PointsOfInterestCache } from './PointsOfInterestCache';
import { PanelInfo } from '../../base/domainObjectsHelpers/PanelInfo';
import { type PointOfInterest, PointsOfInterestStatus } from './types';
import { partition, remove } from 'lodash';
import {
  type CommentProperties,
  type PointsOfInterestProperties,
  type PointsOfInterestInstance
} from './models';
import { Quantity } from '../../base/domainObjectsHelpers/Quantity';
import { type PointsOfInterestProvider } from './PointsOfInterestProvider';

export class PointsOfInterestDomainObject<PoiIdType> extends VisualDomainObject {
  private _selectedPointsOfInterest: PointOfInterest<PoiIdType> | undefined;
  private readonly _poisCache: PointsOfInterestCache<PoiIdType>;

  private _pointsOfInterest: Array<PointOfInterest<PoiIdType>> = [];

  constructor(poiProvider: PointsOfInterestProvider<PoiIdType>) {
    super();

    this._poisCache = new PointsOfInterestCache<PoiIdType>(poiProvider);
    void this._poisCache.getFinishedOriginalLoadingPromise().then((pois) => {
      this._pointsOfInterest = [
        ...pois.map((poi) => ({
          id: poi.id,
          properties: poi.properties,
          status: PointsOfInterestStatus.Default
        })),
        ...this._pointsOfInterest
      ];
      this.notify(Changes.geometry);
    });
  }

  public override get typeName(): TranslateKey {
    return { fallback: PointsOfInterestDomainObject.name };
  }

  protected override createThreeView():
    | ThreeView<PointsOfInterestDomainObject<PoiIdType>>
    | undefined {
    return new PointsOfInterestView();
  }

  public override get canBeRemoved(): boolean {
    return false;
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    const header = { fallback: 'PointsOfInterest' };
    info.setHeader(header);

    if (this._selectedPointsOfInterest !== undefined) {
      const properties = this._selectedPointsOfInterest.properties;
      add('X_COORDINATE', 'X coordinate', properties.positionX, Quantity.Length);
      add('Y_COORDINATE', 'Y coordinate', properties.positionY, Quantity.Length);
      add('Z_COORDINATE', 'Z coordinate', properties.positionZ, Quantity.Length);
    }
    function add(key: string, fallback: string, value: number, quantity: Quantity): void {
      info.add({ key, fallback, value, quantity });
    }
    return info;
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
}
