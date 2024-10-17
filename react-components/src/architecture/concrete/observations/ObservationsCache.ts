/*!
 * Copyright 2024 Cognite AS
 */
import { type ObservationInstance, type ObservationProperties } from './models';
import { type ObservationProvider } from './ObservationProvider';

/**
 * A cache that takes care of loading the observations, but also buffers changes to the overlays
 * list when e.g. adding or removing observations
 */
export class ObservationsCache<ObservationId> {
  private readonly _loadedPromise: Promise<Array<ObservationInstance<ObservationId>>>;
  private readonly _observationProvider: ObservationProvider<ObservationId>;

  constructor(observationProvider: ObservationProvider<ObservationId>) {
    this._observationProvider = observationProvider;
    this._loadedPromise = observationProvider.fetchAllObservations();
  }

  public async getFinishedOriginalLoadingPromise(): Promise<
    Array<ObservationInstance<ObservationId>>
  > {
    return await this._loadedPromise;
  }

  public async deleteObservations(observationIds: ObservationId[]): Promise<void> {
    if (observationIds.length === 0) {
      return;
    }

    await this._observationProvider.deleteObservations(observationIds);
  }

  public async saveObservations(
    observations: ObservationProperties[]
  ): Promise<Array<ObservationInstance<ObservationId>>> {
    if (observations.length === 0) {
      return [];
    }

    return await this._observationProvider.createObservations(observations);
  }
}
