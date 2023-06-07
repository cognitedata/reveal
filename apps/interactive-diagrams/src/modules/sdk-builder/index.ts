import { createSlice, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { InternalId } from '@cognite/sdk';
import { ResourceType, ResourceState, Query } from 'modules/types';
import buildCount from './count';
import buildSearch from './search';
import buildList from './list';
import buildItems from './items';
import {
  updateAction,
  update,
  updateStatusAction,
  updateStatus,
} from './reducers';

export default function resourceBuilder<
  Resource extends InternalId,
  Change extends { id: number; update: any },
  ListScope extends Query,
  SearchFilter extends Query
>(resourceType: ResourceType) {
  const initialState: ResourceState<Resource> = {
    count: {},
    search: {},
    list: {},
    items: {
      list: {},
      retrieve: {
        byId: {},
        byExternalId: {},
      },
      update: {
        byId: {},
        byExternalId: {},
      },
    },
  };
  const { count, countSelector } = buildCount<ListScope>(resourceType);
  const { search, searchSelector } = buildSearch<Resource, SearchFilter>(
    resourceType
  );
  const {
    retrieveItemsById,
    retrieveItemsByExternalId,
    updateItemsById,
    itemSelector,
    externalIdMapSelector,
    retrieveSelector,
  } = buildItems<Resource, Change>(resourceType);

  const {
    list,
    listParallel,
    listPartiallyDoneAction,
    listPartiallyDone,
    listSelector,
  } = buildList(resourceType);

  const itemsResource = {
    retrieveItemsById: retrieveItemsById.action,
    retrieveItemsByExternalId: retrieveItemsByExternalId.action,
    updateItemsById: updateItemsById.action,
  };

  const countReducers = (
    builder: ActionReducerMapBuilder<ResourceState<Resource>>
  ) =>
    builder
      .addCase(count.action.pending, count.pending)
      .addCase(count.action.rejected, count.rejected)
      .addCase(count.action.fulfilled, count.fulfilled);

  const listReducers = (
    builder: ActionReducerMapBuilder<ResourceState<Resource>>
  ) =>
    builder
      .addCase(list.action.pending, list.pending)
      .addCase(list.action.rejected, list.rejected)
      .addCase(list.action.fulfilled, list.fulfilled);

  const searchReducers = (
    builder: ActionReducerMapBuilder<ResourceState<Resource>>
  ) =>
    builder
      .addCase(search.action.pending, search.pending)
      .addCase(search.action.rejected, search.rejected)
      .addCase(search.action.fulfilled, search.fulfilled);

  const retrieveByIdReducers = (
    builder: ActionReducerMapBuilder<ResourceState<Resource>>
  ) =>
    builder
      .addCase(retrieveItemsById.action.pending, retrieveItemsById.pending)
      .addCase(retrieveItemsById.action.rejected, retrieveItemsById.rejected)
      .addCase(retrieveItemsById.action.fulfilled, retrieveItemsById.fulfilled);

  const retrieveByExternalIdReducers = (
    builder: ActionReducerMapBuilder<ResourceState<Resource>>
  ) =>
    builder
      .addCase(
        retrieveItemsByExternalId.action.pending,
        retrieveItemsByExternalId.pending
      )
      .addCase(
        retrieveItemsByExternalId.action.rejected,
        retrieveItemsByExternalId.rejected
      )
      .addCase(
        retrieveItemsByExternalId.action.fulfilled,
        retrieveItemsByExternalId.fulfilled
      );

  const updateByIdReducers = (
    builder: ActionReducerMapBuilder<ResourceState<Resource>>
  ) =>
    builder
      .addCase(updateItemsById.action.pending, updateItemsById.pending)
      .addCase(updateItemsById.action.rejected, updateItemsById.rejected)
      .addCase(updateItemsById.action.fulfilled, updateItemsById.fulfilled);

  const extraReducers = (
    builder: ActionReducerMapBuilder<ResourceState<Resource>>
  ) => {
    countReducers(builder);
    searchReducers(builder);
    listReducers(builder);
    retrieveByIdReducers(builder);
    retrieveByExternalIdReducers(builder);
    updateByIdReducers(builder);
    builder.addCase(updateAction(resourceType), update);
    builder.addCase(updateStatusAction(resourceType), updateStatus);
    builder.addCase(listPartiallyDoneAction(), listPartiallyDone);
  };

  const slice = createSlice({
    name: resourceType,
    initialState,
    reducers: {},
    extraReducers,
  });

  const { reducer } = slice;

  return {
    reducer,
    slice,
    count: count.action,
    search: search.action,
    items: itemsResource,
    list: list.action,
    listParallel,
    retrieveItemsById: retrieveItemsById.action,
    retrieveItemsByExternalId: retrieveItemsByExternalId.action,
    updateItemsById: updateItemsById.action,
    countSelector,
    searchSelector,
    itemSelector,
    listSelector,
    externalIdMapSelector,
    retrieveSelector,
  };
}
