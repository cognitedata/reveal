import { RootState } from 'reducers/index';
import { Function } from 'types/Types';
import buildItems from 'modules/sdk-builder/items';
import { createSelector } from 'reselect';

interface FunctionUpdate extends Function {
  update: any;
}

const { retrieve, itemReducer } = buildItems<Function, FunctionUpdate>(
  'functions',
  (sdk: any) => async () => {
    const result = await sdk.get(
      `/api/playground/projects/${sdk.project}/functions`
    );
    return result.data.items;
  },
  true
);
export { retrieve };
export default itemReducer;

export const functionsSortedRecentlyCreated = createSelector(
  (state: RootState) => state.items.items,
  items =>
    items
      .valueSeq()
      .toJS()
      .sort((a: Function, b: Function) => {
        if (a.createdTime > b.createdTime) {
          return -1;
        }
        if (a.createdTime < b.createdTime) {
          return 1;
        }
        return 0;
      })
);

export const functionsSortedLastCallSelector = createSelector(
  (state: RootState) => state.items.items,
  (state: RootState) => state.allCalls,
  (functions, allCalls) => {
    return functions
      .valueSeq()
      .toJS()
      .sort((a: Function, b: Function) => {
        const callsA = allCalls[a.id]?.functionCalls;
        const callsB = allCalls[b.id]?.functionCalls;
        if (!callsA || !callsB) {
          return 0;
        }
        const latestACallTime = callsA.reduce(
          (prev, el) => (el.startTime > prev ? el.startTime : prev),
          new Date(0)
        );
        const latestBCallTime = callsB.reduce(
          (prev, el) => (el.startTime > prev ? el.startTime : prev),
          new Date(0)
        );
        if (latestACallTime > latestBCallTime) {
          return -1;
        }
        if (latestACallTime < latestBCallTime) {
          return 1;
        }
        return 0;
      });
  }
);
