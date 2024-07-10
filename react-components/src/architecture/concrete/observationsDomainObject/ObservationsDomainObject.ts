/*!
 * Copyright 2024 Cognite AS
 */
import { type Overlay3D } from '@cognite/reveal';
import { type ObservationProperties } from './models';
import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type ThreeView } from '../../base/views/ThreeView';
import { ObservationsView } from './ObservationsView';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type FdmSDK } from '../../../utilities/FdmSDK';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { ObservationsCache } from './ObservationsCache';
import { Vector3 } from 'three';
import { PanelInfo } from '../../base/domainObjectsHelpers/PanelInfo';
import { ObservationCollection, ObservationOverlay } from './types';
import { ObservationStatus } from './ObservationStatus';

export class ObservationsDomainObject extends VisualDomainObject {
  private _selectedObservation: ObservationOverlay | undefined;
  private _observationsCache: ObservationsCache;

  constructor(fdmSdk: FdmSDK) {
    super();

    this._observationsCache = new ObservationsCache(fdmSdk);
    this._observationsCache
      .getFinishedOriginalLoadingPromise()
      .then(() => this.notify(Changes.geometry));
  }

  public override get typeName(): TranslateKey {
    return { fallback: ObservationsDomainObject.name };
  }

  protected override createThreeView(): ThreeView<ObservationsDomainObject> | undefined {
    return new ObservationsView();
  }

  public override get canBeRemoved(): boolean {
    return false;
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    const header = { fallback: 'Observation' };
    info.setHeader(header);

    info.add({ fallback: 'X', value: this._selectedObservation?.getPosition().x });
    info.add({ fallback: 'Y', value: this._selectedObservation?.getPosition().y });
    info.add({ fallback: 'Z', value: this._selectedObservation?.getPosition().z });

    return info;
  }

  public get overlayCollections(): ObservationCollection[] {
    return this._observationsCache.getCollections();
  }

  public addPendingObservation(
    point: Vector3,
    observationData: ObservationProperties
  ): Overlay3D<ObservationProperties> {
    const pendingObservation = this._observationsCache.addPendingObservation(
      point,
      observationData
    );
    this.setSelectedObservation(pendingObservation);

    this.notify(Changes.added);
    return pendingObservation;
  }

  public removeObservation(observation: ObservationOverlay): void {
    this._observationsCache.removeObservation(observation);

    if (observation === this._selectedObservation) {
      this.setSelectedObservation(undefined);
    }

    this.notify(Changes.geometry);
  }

  public getSelectedOverlay(): ObservationOverlay | undefined {
    return this._selectedObservation;
  }

  public getObservationStatus(observation: ObservationOverlay): ObservationStatus {
    return this._observationsCache.getObservationStatus(observation);
  }

  public async save(): Promise<void> {
    if (
      this._selectedObservation !== undefined &&
      this._observationsCache.getObservationStatus(this._selectedObservation) !==
        ObservationStatus.Normal
    ) {
      this.setSelectedObservation(undefined);
    }

    await this._observationsCache.save();
    this.notify(Changes.geometry);
  }

  public setSelectedObservation(observation: ObservationOverlay | undefined): void {
    this._selectedObservation = observation;
    if (this._selectedObservation === undefined) {
      this.setSelectedInteractive(false);
    } else {
      this.setSelectedInteractive(true);
    }

    this.notify(Changes.selected);
  }

  public hasPendingObservations(): boolean {
    return this._observationsCache.getPendingCollection().getOverlays().length !== 0;
  }

  public hasPendingDeletionObservations(): boolean {
    return this._observationsCache.getOverlaysPendingForRemoval().size !== 0;
  }
}
