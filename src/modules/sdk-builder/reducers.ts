import { InternalId, ExternalId } from '@cognite/sdk';
import { createAction } from '@reduxjs/toolkit';
import { ResourceType, Status } from 'modules/types';
import { mapArrayToObj } from 'utils/utils';

/**
 * Action that allows us to update specific type of items from any part of the store.
 * You just need to pass the list of items to update.
 */
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
  state.items.list = {
    ...state.items.list,
    ...mapArrayToObj('id', itemsToUpdate),
  };
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
  state.items[endpoint].byId = {
    ...state.items[endpoint].byExternalId,
    ...mapArrayToObj(
      'id',
      items.map((item: { id: any }) => ({ id: item.id, status }))
    ),
  };
};
