import { CogniteEvent } from '@cognite/sdk';
import { EntityState } from '@reduxjs/toolkit';
import { RequestStatus } from 'store/types';

export interface EventState {
  requestStatus: RequestStatus;
  initialized: boolean;
  events: EntityState<EventSerializable>;
}

export type EventSerializable = Omit<
  CogniteEvent,
  'createdTime' | 'lastUpdatedTime'
> & {
  calculationId: string;
  createdTime?: number;
  lastUpdatedTime?: number;
};
