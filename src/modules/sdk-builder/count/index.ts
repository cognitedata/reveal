import { createAsyncThunk } from '@reduxjs/toolkit';
import sdk from 'sdk-singleton';
import { RootState } from 'store';
import { ResourceType, ApiCountResult, CountState, Query } from 'modules/types';
import { createCountSelector } from './selectors';

export const defaultCount: ApiCountResult = {};

export default function buildCount<Q extends Query>(
  resourceType: ResourceType
) {
  const count = {
    action: createAsyncThunk(
      `${resourceType}/count`,
      async ({ filter }: { filter: Q }) => {
        const path = `/api/v1/projects/${sdk.project}/${resourceType}/aggregate`;
        const adjustedFilter = filter.filter ? filter : { filter };
        const {
          data: {
            items: [{ count: aggregateCount }],
          },
        } = await sdk.post(path, {
          data: adjustedFilter || {},
        });
        return {
          filter,
          count: aggregateCount,
        } as { filter: any; count: any };
      }
    ),
    pending: (state: any, action: any): void => {
      const key: string = JSON.stringify(action.meta.arg.filter);
      if (!state.count[key]) {
        state.count[key] = { ...defaultCount };
      }
      state.count[key].status = 'pending';
    },
    rejected: (state: any, action: any): void => {
      const key = JSON.stringify(action.meta.arg.filter);
      state.count[key].status = 'error';
    },
    fulfilled: (state: any, action: any): void => {
      const { filter, count: countNr } = action.payload;
      const key = JSON.stringify(filter);
      state.count[key].status = 'success';
      state.count[key].count = countNr;
    },
  };

  const countSelector = createCountSelector(
    (state: RootState) => state[resourceType].count as CountState
  );

  return {
    count,
    countSelector,
  };
}
