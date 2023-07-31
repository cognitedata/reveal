import { getMockedStore } from '__test-utils/store.utils';
import { initialState as wellInspectState } from 'modules/wellInspect/reducer';

import { WellInspectState } from '../types';

/**
 * Use this store to easily mock any well state
 */
export const getMockStoreWellInspect = (extras?: Partial<WellInspectState>) => {
  return getMockedStore(getStoreStateWellInspect(extras));
};

export const getStoreStateWellInspect = (
  extras?: Partial<WellInspectState>
) => {
  return {
    wellInspect: {
      ...wellInspectState,
      ...extras,
    },
  };
};
