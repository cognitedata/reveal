import { PartialStoreState } from 'core';
import fetchMock from 'fetch-mock';

import { Asset, Sequence } from '@cognite/sdk';

import {
  getDefaultWell,
  getDefaultWellbore,
  // WELL_TRAJ_COLUMNS,
} from '__test-utils/fixtures/well';
import { getMockedStore, getInitialStore } from '__test-utils/store.utils';
import { AppStore } from '__test-utils/types';

import { wellSearchActions } from '../actions';
import {
  RESET_QUERY,
  SET_SELECTED_WELL_ID,
  SET_SELECTED_WELLBORE_IDS,
  SET_SEARCH_PHRASE,
  TOGGLE_EXPANDED_WELL_ID,
  TOGGLE_SELECTED_WELLS,
  SET_LOG_TYPE,
  SET_LOGS_ROW_DATA,
  SET_WELLBORE_ASSETS,
  SET_WELLBORE_DIGITAL_ROCK_SAMPLES,
  SET_SELECTED_WELLBORE_IDS_WITH_WELL_ID,
  SET_HOVERED_WELLBORE_IDS,
  SET_INSECT_WELLBORES_CONTEXT,
  InspectWellboreContext,
  SET_SELECTED_SECONDARY_WELL_IDS,
  SET_SELECTED_SECONDARY_WELLBORE_IDS,
} from '../types';

// import { wellSearchService } from '../service';

const getDefaultTestValues = () => {
  const well = getDefaultWell();
  const wellbore = getDefaultWellbore();

  const initialStore: PartialStoreState = getInitialStore();
  const store: AppStore = getMockedStore({
    wellSearch: {
      ...initialStore.wellSearch,
      // wells: [well],
    },
  });

  return { store, well, wellbore };
};

describe('Well search Actions', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  afterAll(jest.clearAllMocks);

  beforeEach(() => jest.clearAllMocks());

  describe('resetQuery', () => {
    it(`should reset query`, async () => {
      const { store } = getDefaultTestValues();
      await store.dispatch(wellSearchActions.resetQuery() as any);
      expect(store.getActions()).toContainEqual({ type: RESET_QUERY });
    });
  });

  describe('setSearchPhrase', () => {
    it(`should set the search phrase`, async () => {
      const phrase = '16/1';
      const { store } = getDefaultTestValues();
      await store.dispatch(wellSearchActions.setSearchPhrase(phrase) as any);
      expect(store.getActions()).toEqual([
        {
          type: SET_SEARCH_PHRASE,
          phrase,
        },
      ]);
    });
  });

  describe('setSelectedWell', () => {
    it(`should set selected well`, async () => {
      const { store, well } = getDefaultTestValues();
      await store.dispatch(
        wellSearchActions.setSelectedWell(well, true) as any
      );
      expect(store.getActions()).toEqual([
        {
          type: SET_SELECTED_WELL_ID,
          id: well.id,
          value: true,
        },
      ]);
    });
  });

  describe('setSelectedWellbores', () => {
    it(`should set selected wellbore`, async () => {
      const { store, wellbore } = getDefaultTestValues();
      const ids = { [wellbore.id]: true };
      await store.dispatch(wellSearchActions.setSelectedWellbores(ids) as any);
      expect(store.getActions()).toEqual([
        {
          type: SET_SELECTED_WELLBORE_IDS,
          ids,
        },
      ]);
    });
  });

  describe('setSelectedWellboresWithWell', () => {
    it(`should set selected wellbore with parent well`, async () => {
      const { store, wellbore, well } = getDefaultTestValues();
      const ids = { [wellbore.id]: true };
      await store.dispatch(
        wellSearchActions.setSelectedWellboresWithWell(ids, well.id) as any
      );
      expect(store.getActions()).toEqual([
        {
          type: SET_SELECTED_WELLBORE_IDS_WITH_WELL_ID,
          ids,
          wellId: well.id,
        },
      ]);
    });
  });

  describe('toggleExpandedWell', () => {
    it(`should toggle expanded well status`, async () => {
      const { store, well } = getDefaultTestValues();
      await store.dispatch(wellSearchActions.toggleExpandedWell(well) as any);
      expect(store.getActions()).toEqual([
        {
          type: TOGGLE_EXPANDED_WELL_ID,
          id: well.id,
        },
      ]);
    });
  });

  describe('toggleSelectedWells', () => {
    it(`should toggle selected wells status`, async () => {
      const { store } = getDefaultTestValues();
      await store.dispatch(wellSearchActions.toggleSelectedWells(true) as any);
      expect(store.getActions()).toEqual([
        {
          type: TOGGLE_SELECTED_WELLS,
          value: true,
        },
      ]);
    });
  });

  describe('getLogType', () => {
    it(`should fetch log types for the give wellbore`, async () => {
      const { store } = getDefaultTestValues();
      const logId = 1234;
      await store.dispatch(
        wellSearchActions.getLogType(
          [logId],
          {},
          [{}, {}],
          ['logsFrmTops', 'logs']
        ) as any
      );
      expect(store.getActions()).toEqual([
        {
          type: SET_LOG_TYPE,
          data: { logs: { [logId]: [] }, logsFrmTops: { [logId]: [] } },
        },
      ]);
    });
  });

  describe('getLogData', () => {
    it(`should fetch log rows for the given logs`, async () => {
      const { store } = getDefaultTestValues();
      const log = { id: 1234 } as Sequence;
      await store.dispatch(wellSearchActions.getLogData([log], [log]) as any);
      expect(store.getActions()).toEqual([
        {
          type: SET_LOGS_ROW_DATA,
          data: { logs: [{ log, rows: [] }], logsFrmTops: [{ log, rows: [] }] },
        },
      ]);
    });
  });

  describe('getWellboreAssets', () => {
    it(`should fetch assets for the given Wellbores`, async () => {
      const { store } = getDefaultTestValues();
      const assetType = 'digitalRocks';
      const fetcher: any = () =>
        new Promise((resolve) => {
          resolve([]);
        });
      const wellboreId = 123;

      await store.dispatch(
        wellSearchActions.getWellboreAssets(
          [wellboreId],
          {},
          assetType,
          fetcher
        ) as any
      );
      expect(store.getActions()).toEqual([
        {
          type: SET_WELLBORE_ASSETS,
          data: { [wellboreId]: [] },
          assetType,
        },
      ]);
    });
  });

  describe('getDigitalRockSamples', () => {
    it(`should fetch digital rock samples for the given digital rock list`, async () => {
      const { store } = getDefaultTestValues();
      const wellboreId = 123;
      const digitalRocks = [{ id: 123, parentId: wellboreId }] as Asset[];
      const fetcher: any = () =>
        new Promise((resolve) => {
          resolve([]);
        });

      await store.dispatch(
        wellSearchActions.getDigitalRockSamples(digitalRocks, fetcher) as any
      );
      expect(store.getActions()).toEqual([
        {
          type: SET_WELLBORE_DIGITAL_ROCK_SAMPLES,
          data: [
            {
              wellboreId,
              digitalRockId: digitalRocks[0].id,
              digitalRockSamples: [],
            },
          ],
        },
      ]);
    });
  });

  describe('setHoveredWellbores without wellbore', () => {
    it(`should set all wellbores of hovered well to state`, async () => {
      const { store, well } = getDefaultTestValues();
      await store.dispatch(
        wellSearchActions.setHoveredWellbores(well.id) as any
      );
      expect(store.getActions()).toEqual([
        {
          type: SET_HOVERED_WELLBORE_IDS,
          wellId: well.id,
          wellboreId: undefined,
        },
      ]);
    });
  });

  describe('setHoveredWellbores with wellbore', () => {
    it(`should set passed wellbore of hovered well to state`, async () => {
      const { store, well } = getDefaultTestValues();
      await store.dispatch(
        wellSearchActions.setHoveredWellbores(well.id, 1234) as any
      );
      expect(store.getActions()).toEqual([
        {
          type: SET_HOVERED_WELLBORE_IDS,
          wellId: well.id,
          wellboreId: 1234,
        },
      ]);
    });
  });

  describe('setWellboreInspectContext', () => {
    it(`should set inspect context to state`, async () => {
      const { store } = getDefaultTestValues();
      await store.dispatch(
        wellSearchActions.setWellboreInspectContext(
          InspectWellboreContext.CHECKED_WELLBORES
        ) as any
      );
      expect(store.getActions()).toEqual([
        {
          type: SET_INSECT_WELLBORES_CONTEXT,
          context: InspectWellboreContext.CHECKED_WELLBORES,
        },
      ]);
    });
  });

  describe('setSelectedSecondaryWellIds', () => {
    it(`should set secondary selected well ids`, async () => {
      const { store, well } = getDefaultTestValues();
      const ids = { [well.id]: true };
      await store.dispatch(
        wellSearchActions.setSelectedSecondaryWellIds(ids, true)
      );
      expect(store.getActions()).toEqual([
        {
          type: SET_SELECTED_SECONDARY_WELL_IDS,
          ids,
          reset: true,
        },
      ]);
    });
  });

  describe('setSelectedSecondaryWellboreIds', () => {
    it(`should set secondary selected wellbore ids`, async () => {
      const { store, wellbore } = getDefaultTestValues();
      const ids = { [wellbore.id]: true };
      await store.dispatch(
        wellSearchActions.setSelectedSecondaryWellboreIds(ids)
      );
      expect(store.getActions()).toEqual([
        {
          type: SET_SELECTED_SECONDARY_WELLBORE_IDS,
          ids,
        },
      ]);
    });
  });
});
