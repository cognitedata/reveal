/*!
 * Copyright 2024 Cognite AS
 */
import { type DmsUniqueIdentifier, type FdmSDK } from '../../../../data-providers/FdmSDK';
import { type ObservationInstance, type ObservationProperties } from '../models';
import { type ObservationProvider } from '../ObservationProvider';
import {
  createObservationInstances,
  deleteObservationInstances,
  fetchObservations
} from './network';

export class FdmObservationProvider implements ObservationProvider<DmsUniqueIdentifier> {
  constructor(private readonly _fdmSdk: FdmSDK) {}

  async createObservations(
    observations: ObservationProperties[]
  ): Promise<Array<ObservationInstance<DmsUniqueIdentifier>>> {
    return await createObservationInstances(this._fdmSdk, observations);
  }

  async fetchAllObservations(): Promise<Array<ObservationInstance<DmsUniqueIdentifier>>> {
    return await fetchObservations(this._fdmSdk);
  }

  async deleteObservations(ids: DmsUniqueIdentifier[]): Promise<void> {
    await deleteObservationInstances(this._fdmSdk, ids);
  }
}
