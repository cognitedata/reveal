import { PartialStoreState } from 'core';
import fetchMock from 'fetch-mock';

import { getMockedStore, getInitialStore } from '__test-utils/store.utils';
import { AppStore } from '__test-utils/types';

import {
  setInspectSidebarWidth,
  setSelectedRelatedDocumentColumns,
} from '../actions';
import {
  SET_INSPECT_SIDEBAR_WIDTH,
  SET_SELECTED_RELATED_DOCUMENT_COLUMNS,
  WellInspectState,
} from '../types';

const getDefaultTestValues = (partialState?: Partial<WellInspectState>) => {
  const initialStore: PartialStoreState = getInitialStore();
  const store: AppStore = getMockedStore({
    wellInspect: {
      ...initialStore.wellInspect,
      ...partialState,
    },
  });

  return { store };
};

describe('Well search Actions', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  afterAll(jest.clearAllMocks);
  beforeEach(() => jest.clearAllMocks());

  describe('setSelectedRelatedDocumentColumns', () => {
    it(`should set inspect sidebar width`, async () => {
      const { store } = getDefaultTestValues();
      const width = 400;
      await store.dispatch(setInspectSidebarWidth(width));
      expect(store.getActions()).toEqual([
        {
          type: SET_INSPECT_SIDEBAR_WIDTH,
          payload: width,
        },
      ]);
    });

    it(`should set selected related documents columns`, async () => {
      const { store } = getDefaultTestValues();
      const payload = { fileName: true, source: true };
      await store.dispatch(setSelectedRelatedDocumentColumns(payload));
      expect(store.getActions()).toEqual([
        {
          type: SET_SELECTED_RELATED_DOCUMENT_COLUMNS,
          payload,
        },
      ]);
    });
  });
});
