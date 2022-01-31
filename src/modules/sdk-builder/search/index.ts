import { createAsyncThunk } from '@reduxjs/toolkit';
import { InternalId } from '@cognite/sdk';
import { RootState } from 'store';
import sdk from '@cognite/cdf-sdk-singleton';
import {
  ApiSearchResult,
  Query,
  ResourceType,
  ItemsList,
  SearchState,
} from 'modules/types';
import { updateAction as update } from '../reducers';
import { createSearchSelector } from './selectors';

export const defaultSearch: ApiSearchResult = { ids: [], status: undefined };

export default function buildSearch<T extends InternalId, Q extends Query>(
  resourceType: ResourceType
) {
  const search = {
    action: createAsyncThunk(
      `${resourceType}/search`,
      async ({ filter }: { filter: any }, { dispatch }: { dispatch: any }) => {
        const searchFn: (q: Query) => Promise<InternalId[]> =
          sdk[resourceType].search;
        const result: InternalId[] = (await searchFn(filter)) as InternalId[];
        if (result) dispatch(update(resourceType)(result));
        return {
          filter,
          result,
        } as { filter: any; result: any };
      }
    ),
    pending: (state: any, action: any): void => {
      const key: string = JSON.stringify(action.meta.arg.filter);
      if (!state.search[key]) {
        state.search[key] = { ...defaultSearch };
      }
      state.search[key].status = 'pending';
    },
    rejected: (state: any, action: any): void => {
      const key = JSON.stringify(action.meta.arg.filter);
      state.search[key].status = 'error';
    },
    fulfilled: (state: any, action: any): void => {
      const { filter, result } = action.payload;
      const key = JSON.stringify(filter);
      const ids = result.map((resource: any) => resource.id);
      state.search[key].status = 'success';
      state.search[key].ids = ids;
    },
  };

  const searchSelector = createSearchSelector<T, Q>(
    // @ts-ignore
    (state: RootState) => state[resourceType].items.list as ItemsList<T>,
    (state: RootState) => state[resourceType].search as SearchState
  ) as any; // FIX THIS

  return { search, searchSelector };
}
