/*!
 * Copyright 2024 Cognite AS
 */
import { type FdmSDK } from '../../../data-providers/FdmSDK';
import { type ObservationFdmNode, type ObservationProperties } from './models';

import { type Observation } from './types';
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

  constructor(fdmSdk: FdmSDK) {
    this._loadedPromise = fetchObservations(fdmSdk);
  }

  public async getFinishedOriginalLoadingPromise(): Promise<ObservationFdmNode[]> {
    return await this._loadedPromise;
  }

  public async deleteObservations(fdmSdk: FdmSDK, observations: Observation[]): Promise<void> {
    if (observations.length === 0) {
      return;
    }

    const observationData = observations
      .map((observation) => observation.fdmMetadata)
      .filter(isDefined);

    await deleteObservationInstances(fdmSdk, observationData);
  }

  public async saveObservations(
    fdmSdk: FdmSDK,
    observations: ObservationProperties[]
  ): Promise<ObservationFdmNode[]> {
    if (observations.length === 0) {
      return [];
    }

    return await createObservationInstances(fdmSdk, observations);
  }
}
