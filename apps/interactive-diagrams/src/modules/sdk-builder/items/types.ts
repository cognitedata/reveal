import { InternalId } from '@cognite/sdk';
import { ApiCall, Status } from 'modules/types';

export interface ItemStore<T extends InternalId & { externalId?: string }> {
  items: Map<number, T>;
  getById: { [key: number]: Request };
  getByExternalId: { [key: string]: Request };
}

export interface ApiItemsResult extends ApiCall {
  ids?: number[];
}

export type ItemsList<T> = { [key: string]: T };
export type ItemsMappedExternalIdsToIds<T> = {
  id: T[];
}[];

export type ItemsAsyncStatus = { [key: string]: ItemStatus };
export interface ItemsState<T> {
  list: ItemsList<T>;
  update: {
    byId: ItemsAsyncStatus;
    byExternalId: ItemsAsyncStatus;
  };
  retrieve: {
    byId: ItemsAsyncStatus;
    byExternalId: ItemsAsyncStatus;
  };
}

export type ItemRetrieveStatus<T> = {
  progress: boolean;
  fetching: number;
  done: number;
  error: number;
  items: ItemsList<T>;
};
export interface ItemStatus {
  status: Status;
  id?: number;
}
