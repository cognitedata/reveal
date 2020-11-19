import { toast } from '@cognite/cogs.js';
import { nanoid } from '@reduxjs/toolkit';
import { selectTenant, selectUser } from 'reducers/environment';
import CollectionService from 'services/CollectionService';
import { AppThunk } from 'store';
import collectionsSlice from './slice';
import { Collection } from './types';

export const fetchAllCollections = (): AppThunk => async (
  dispatch,
  getState
) => {
  const state = getState();

  if (state.collections.status.status === 'LOADING') {
    return;
  }

  const tenant = selectTenant(state);
  const { email: user } = selectUser(state);

  if (!tenant || !user) {
    return;
  }

  dispatch(collectionsSlice.actions.startLoadingAllCollections());

  try {
    const collectionService = new CollectionService(tenant, user);
    const allCollections = await collectionService.getCollections();
    dispatch(
      collectionsSlice.actions.finishedLoadingAllCollections(allCollections)
    );
  } catch (e) {
    dispatch(collectionsSlice.actions.failedLoadingAllCollections(e));
  }
};

export const createNewCollection = (): AppThunk => async (
  dispatch,
  getState
) => {
  const state = getState();
  const tenant = selectTenant(state);
  const { email: user } = selectUser(state);

  if (!tenant || !user) {
    return;
  }

  const id = nanoid();
  const newCollection: Collection = {
    id,
    name: `collection-${id}`,
    resources: [],
  };

  dispatch(collectionsSlice.actions.startStoringNewCollection());

  try {
    // Create the collection
    const collectionService = new CollectionService(tenant, user);
    await collectionService.saveCollection(newCollection);
    dispatch(collectionsSlice.actions.storedNewCollection(newCollection));
  } catch (e) {
    dispatch(dispatch(collectionsSlice.actions.failedStoringNewCollection(e)));
  }
};

export const saveExistingCollection = (
  collection: Collection
): AppThunk => async (_, getState) => {
  const state = getState();
  const tenant = selectTenant(state);
  const { email: user } = selectUser(state);

  if (!tenant || !user) {
    // Must have tenant and user set
    return;
  }

  try {
    // Create the collection
    const collectionService = new CollectionService(tenant, user);
    collectionService.saveCollection(collection);
    toast.success('Collection saved!');
  } catch (e) {
    toast.error('Failed to save collection');
  }
};
