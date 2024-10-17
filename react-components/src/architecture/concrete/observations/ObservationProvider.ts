/*!
 * Copyright 2024 Cognite AS
 */
import { type ObservationInstance, type ObservationProperties } from './models';

export type ObservationProvider<ID> = {
  createObservations: (
    observations: ObservationProperties[]
  ) => Promise<Array<ObservationInstance<ID>>>;
  fetchAllObservations: () => Promise<Array<ObservationInstance<ID>>>;
  deleteObservations: (observations: ID[]) => Promise<void>;
};
