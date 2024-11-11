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
import { CommentProperties, type PointsOfInterestProperties } from './models';
import { Quantity } from '../../base/domainObjectsHelpers/Quantity';
import { type PointsOfInterestProvider } from './PointsOfInterestProvider';
import { isDefined } from '../../../utilities/isDefined';

export class PointsOfInterestDomainObject<PoIIdType> extends VisualDomainObject {
  private _selectedPointsOfInterest: PointOfInterest<PoIIdType> | undefined;
  private readonly _poisCache: PointsOfInterestCache<PoIIdType>;

  private _pointsOfInterest: Array<PointOfInterest<PoIIdType>> = [];

  constructor(poiProvider: PointsOfInterestProvider<PoIIdType>) {
    super();

    this._poisCache = new PointsOfInterestCache<PoIIdType>(poiProvider);
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
    | ThreeView<PointsOfInterestDomainObject<PoIIdType>>
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
      info.add({ fallback: 'X', value: properties.positionX, quantity: Quantity.Length });
      info.add({ fallback: 'Y', value: properties.positionY, quantity: Quantity.Length });
      info.add({ fallback: 'Z', value: properties.positionZ, quantity: Quantity.Length });
    }
    return info;
  }

  public addPendingPointsOfInterest(
    poiData: PointsOfInterestProperties
  ): PointOfInterest<PoIIdType> {
    const newPointsOfInterest = {
      properties: poiData,
      status: PointsOfInterestStatus.PendingCreation
    };

    this._pointsOfInterest.push(newPointsOfInterest);

    this.notify(Changes.geometry);

    return newPointsOfInterest;
  }

  public removePointsOfInterest(poiToDelete: PointOfInterest<PoIIdType>): void {
    if (poiToDelete.status === PointsOfInterestStatus.PendingCreation) {
      remove(this._pointsOfInterest, (poi) => poiToDelete === poi);
    } else if (this._pointsOfInterest.includes(poiToDelete)) {
      poiToDelete.status = PointsOfInterestStatus.PendingDeletion;
    }

    this.notify(Changes.geometry);
  }

  public get pointsOfInterest(): Array<PointOfInterest<PoIIdType>> {
    return this._pointsOfInterest;
  }

  public get selectedPointsOfInterest(): PointOfInterest<PoIIdType> | undefined {
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
      this.setSelectedPointsOfInterest(undefined);
    }

    const [toRemove, notToRemove] = partition(
      this._pointsOfInterest,
      (poi) => poi.status === PointsOfInterestStatus.PendingDeletion
    );

    const deletePromise = this._poisCache.deletePointsOfInterest(
      toRemove.map((poi) => poi.id).filter(isDefined)
    );

    const poisToCreate = this._pointsOfInterest.filter(
      (obs) => obs.status === PointsOfInterestStatus.PendingCreation
    );
    const newPointsOfInterest = await this._poisCache.savePointsOfInterest(
      poisToCreate.map((obs) => obs.properties)
    );

    this._pointsOfInterest = notToRemove
      .filter((poi) => poi.status === PointsOfInterestStatus.Default)
      .concat(
        newPointsOfInterest.map((poi) => ({
          status: PointsOfInterestStatus.Default,
          fdmMetadata: poi,
          properties: poi.properties
        }))
      );

    await deletePromise;

    this.notify(Changes.geometry);
  }

  public setSelectedPointsOfInterest(poi: PointOfInterest<PoIIdType> | undefined): void {
    this._selectedPointsOfInterest = poi;

    this.notify(Changes.selected);
  }

  public async postCommentForPoi(
    poi: PointOfInterest<PoIIdType>,
    content: string
  ): Promise<CommentProperties | undefined> {
    if (poi.id === undefined) {
      return undefined;
    }

    return this._poisCache.postCommentForPoi(poi.id, content);
  }

  public async getCommentsForPoi(poi: PointOfInterest<PoIIdType>): Promise<CommentProperties[]> {
    if (poi.id === undefined) {
      return [];
    }
    return this._poisCache.getPoiCommentsForPoi(poi.id);
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
