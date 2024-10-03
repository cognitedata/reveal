/*!
 * Copyright 2024 Cognite AS
 */
import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type ThreeView } from '../../base/views/ThreeView';
import { ObservationsView } from './ObservationsView';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type FdmSDK } from '../../../data-providers/FdmSDK';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { ObservationsCache } from './ObservationsCache';
import { PanelInfo } from '../../base/domainObjectsHelpers/PanelInfo';
import { type Observation, ObservationStatus } from './types';
import { partition, remove } from 'lodash';
import { type ObservationProperties } from './models';
import { Quantity } from '../../base/domainObjectsHelpers/Quantity';

export class ObservationsDomainObject extends VisualDomainObject {
  private _selectedObservation: Observation | undefined;
  private readonly _observationsCache: ObservationsCache;

  private _observations: Observation[] = [];

  constructor(fdmSdk: FdmSDK) {
    super();

    this._observationsCache = new ObservationsCache(fdmSdk);
    void this._observationsCache.getFinishedOriginalLoadingPromise().then((observations) => {
      this._observations = observations.map((observation) => ({
        fdmMetadata: observation,
        properties: observation.properties,
        status: ObservationStatus.Default
      }));
      this.notify(Changes.geometry);
    });
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

    if (this._selectedObservation !== undefined) {
      const properties = this._selectedObservation.properties;
      info.add({ fallback: 'X', value: properties.positionX, quantity: Quantity.Length });
      info.add({ fallback: 'Y', value: properties.positionY, quantity: Quantity.Length });
      info.add({ fallback: 'Z', value: properties.positionZ, quantity: Quantity.Length });
    }
    return info;
  }

  public addPendingObservation(observationData: ObservationProperties): Observation {
    const newObservation = {
      properties: observationData,
      status: ObservationStatus.PendingCreation
    };

    this._observations.push(newObservation);

    this.notify(Changes.geometry);

    return newObservation;
  }

  public removeObservation(observation: Observation): void {
    if (observation.status === ObservationStatus.PendingCreation) {
      remove(this._observations, observation);
    } else if (this._observations.includes(observation)) {
      observation.status = ObservationStatus.PendingDeletion;
    }

    this.notify(Changes.geometry);
  }

  public get observations(): Observation[] {
    return this._observations;
  }

  public get selectedObservation(): Observation | undefined {
    return this._selectedObservation;
  }

  public async save(): Promise<void> {
    const fdmSdk = this.rootDomainObject?.fdmSdk;
    if (fdmSdk === undefined) {
      return fdmSdk;
    }

    if (
      this._selectedObservation !== undefined &&
      (this._selectedObservation.status === ObservationStatus.PendingCreation ||
        this._selectedObservation.status === ObservationStatus.PendingDeletion)
    ) {
      this.setSelectedObservation(undefined);
    }

    const [toRemove, notToRemove] = partition(
      this._observations,
      (observation) => observation.status === ObservationStatus.PendingDeletion
    );

    const deletePromise = this._observationsCache.deleteObservations(fdmSdk, toRemove);

    const observationsToCreate = this._observations.filter(
      (obs) => obs.status === ObservationStatus.PendingCreation
    );
    const newObservations = await this._observationsCache.saveObservations(
      fdmSdk,
      observationsToCreate.map((obs) => obs.properties)
    );

    this._observations = notToRemove
      .filter((observation) => observation.status === ObservationStatus.Default)
      .concat(
        newObservations.map((observation) => ({
          status: ObservationStatus.Default,
          fdmMetadata: observation,
          properties: observation.properties
        }))
      );

    await deletePromise;

    this.notify(Changes.geometry);
  }

  public setSelectedObservation(observation: Observation | undefined): void {
    this._selectedObservation = observation;

    this.notify(Changes.selected);
  }

  public hasPendingObservations(): boolean {
    return this._observations.some(
      (observation) => observation.status === ObservationStatus.PendingCreation
    );
  }

  public hasPendingDeletionObservations(): boolean {
    return this._observations.some(
      (observations) => observations.status === ObservationStatus.PendingDeletion
    );
  }
}
