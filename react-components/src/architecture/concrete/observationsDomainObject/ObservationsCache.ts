import { CDF_TO_VIEWER_TRANSFORMATION, Overlay3D, Overlay3DCollection } from '@cognite/reveal';
import { FdmSDK } from '../../../utilities/FdmSDK';
import { Observation, ObservationProperties } from './models';
import { Vector3 } from 'three';

import { isPendingObservation, ObservationCollection, ObservationOverlay } from './types';
import {
  createObservationInstances,
  deleteObservationInstances,
  fetchObservations
} from './network';
import { ObservationStatus } from './ObservationStatus';

/**
 * A cache that takes care of loading the observations, but also buffers changes to the overlays
 * list when e.g. adding or removing observations
 */
export class ObservationsCache {
  private _loadedPromise: Promise<void>;
  private _fdmSdk: FdmSDK;

  private _persistedCollection = new Overlay3DCollection<Observation>([]);

  private _pendingOverlaysCollection = new Overlay3DCollection<ObservationProperties>([]);

  private _pendingDeletionObservations: Set<Overlay3D<Observation>> = new Set();

  constructor(fdmSdk: FdmSDK) {
    this._loadedPromise = fetchObservations(fdmSdk)
      .then((data) => this.initializeCollection(data))
      .then();
    this._fdmSdk = fdmSdk;
  }

  public getFinishedOriginalLoadingPromise(): Promise<void> {
    return this._loadedPromise;
  }

  public getPersistedCollection(): Overlay3DCollection<Observation> {
    return this._persistedCollection;
  }

  public getPendingCollection(): Overlay3DCollection<ObservationProperties> {
    return this._pendingOverlaysCollection;
  }

  public getOverlaysPendingForRemoval(): Set<Overlay3D<Observation>> {
    return this._pendingDeletionObservations;
  }

  public getCollections(): ObservationCollection[] {
    return [this._persistedCollection, this._pendingOverlaysCollection];
  }

  public addPendingObservation(
    point: Vector3,
    observation: ObservationProperties
  ): Overlay3D<ObservationProperties> {
    return this._pendingOverlaysCollection.addOverlays([
      { position: point, content: observation }
    ])[0];
  }

  public removeObservation(observation: ObservationOverlay): void {
    if (isPendingObservation(observation)) {
      this.removePendingObservation(observation);
    } else {
      this.markObservationForRemoval(observation);
    }
  }

  public async save(): Promise<void> {
    await this._loadedPromise;
    await this.savePendingObservations();
    await this.removeDeletedObservations();
  }

  public removePendingObservation(observation: Overlay3D<ObservationProperties>): void {
    this._pendingOverlaysCollection.removeOverlays([observation]);
  }

  public markObservationForRemoval(observation: Overlay3D<Observation>): void {
    this._pendingDeletionObservations.add(observation);
  }

  public getObservationStatus(observation: ObservationOverlay): ObservationStatus {
    if (isPendingObservation(observation)) {
      return ObservationStatus.PendingCreation;
    } else if (
      !isPendingObservation(observation) &&
      this._pendingDeletionObservations.has(observation)
    ) {
      return ObservationStatus.PendingDeletion;
    } else {
      return ObservationStatus.Normal;
    }
  }

  private async removeDeletedObservations(): Promise<void> {
    const overlaysToRemove = [...this._pendingDeletionObservations];

    await deleteObservationInstances(this._fdmSdk, overlaysToRemove);

    this._persistedCollection.removeOverlays(overlaysToRemove);
    this._pendingDeletionObservations.clear();
  }

  private async savePendingObservations(): Promise<void> {
    const overlays = this._pendingOverlaysCollection.getOverlays();
    if (overlays.length === 0) {
      return;
    }

    const instances = await createObservationInstances(this._fdmSdk, overlays);

    const overlayPositions = overlays.map((overlay) => overlay.getPosition());

    this._pendingOverlaysCollection.removeAllOverlays();
    this._persistedCollection.addOverlays(
      instances.map((instance, index) => ({ content: instance, position: overlayPositions[index] }))
    );
  }

  private initializeCollection(observations: Observation[]) {
    const observationOverlays = observations.map((observation) => {
      const position = new Vector3(
        observation.properties.positionX,
        observation.properties.positionY,
        observation.properties.positionZ
      ).applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

      return {
        position,
        content: observation
      };
    });

    this._persistedCollection.addOverlays(observationOverlays);
  }
}
