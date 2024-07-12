/*!
 * Copyright 2024 Cognite AS
 */
import { type FdmSDK } from '../../../utilities/FdmSDK';
import { type ObservationFdmNode, type ObservationProperties } from './models';

import { Observation } from './types';
import {
  createObservationInstances,
  deleteObservationInstances,
  fetchObservations
} from './network';
import { isDefined } from '../../../utilities/isDefined';

/**
 * A cache that takes care of loading the observations, but also buffers changes to the overlays
 * list when e.g. adding or removing observations
 */
export class ObservationsCache {
  private readonly _loadedPromise: Promise<ObservationFdmNode[]>;
  private readonly _fdmSdk: FdmSDK;

  constructor(fdmSdk: FdmSDK) {
    this._loadedPromise = fetchObservations(fdmSdk);
    this._fdmSdk = fdmSdk;
  }

  public async getFinishedOriginalLoadingPromise(): Promise<ObservationFdmNode[]> {
    return await this._loadedPromise;
  }

  public async deleteObservations(observations: Observation[]): Promise<void> {
    if (observations.length === 0) {
      return;
    }

    console.log('Thinking to delete', observations);
    const observationData = observations
      .map((observation) => observation.fdmMetadata)
      .filter(isDefined);

    console.log('Deleting ', observationData);

    await deleteObservationInstances(this._fdmSdk, observationData);
  }

  public async saveObservations(
    observations: ObservationProperties[]
  ): Promise<ObservationFdmNode[]> {
    if (observations.length === 0) {
      return [];
    }

    console.log('Saving ', observations);

    return await createObservationInstances(this._fdmSdk, observations);
  }
}
