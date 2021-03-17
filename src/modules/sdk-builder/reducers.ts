import { InternalId, ExternalId } from '@cognite/sdk';
import { createAction } from '@reduxjs/toolkit';
import { ResourceType, Status } from './types';

export const updateAction = (resourceType: ResourceType) =>
  createAction(`${resourceType}/update`, (items) => {
    return {
      payload: {
        items,
      },
    };
  });

export const update = (state: any, action: any) => {
  const { items: itemsToUpdate } = action.payload;
  itemsToUpdate.forEach((item: any) => {
    state.items.list = {
      ...state.items.list,
      [item.id]: { ...item },
    };
  });
};

/**
 * Action that allows us to update status of the endpoint request from any part of the store.
 * For example, to update status of state.items.retrieve.byExternalId we need to pass an object:
 * {
 *    items: any[],
 *    endpoint: 'retrieve',
 *    idType: 'externalId'
 * }
 */

export const updateStatusAction = (resourceType: ResourceType) =>
  createAction(
    `${resourceType}/updateStatus`,
    (
      items: any[] & (InternalId[] | ExternalId[]),
      endpoint: 'retrieve' | 'update',
      status: Status
    ) => {
      return {
        payload: {
          items,
          endpoint,
          status,
        },
      };
    }
  );

export const updateStatus = (state: any, action: any) => {
  const { items, endpoint, status } = action.payload;
  items.forEach((item: any) => {
    const getIdType = (): 'byId' | 'byExternalId' | undefined => {
      if (item.id) return 'byId';
      if (item.externalId) return 'byExternalId';
      return undefined;
    };
    const id = item.id ?? item.externalId;
    const idType = getIdType();
    if (id && idType) {
      state.items[endpoint][idType] = {
        ...state.items[endpoint][idType],
        [id]: { status, id },
      };
    }
  });
};
