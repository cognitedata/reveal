import { PartialStoreState } from 'core';
import fetchMock from 'fetch-mock';

import { Asset, Sequence } from '@cognite/sdk';

import {
  getDefaultWell,
  getDefaultWellbore,
  getMockWell,
  // WELL_TRAJ_COLUMNS,
} from '__test-utils/fixtures/well';
import { getMockedStore, getInitialStore } from '__test-utils/store.utils';
import { AppStore } from '__test-utils/types';

import { wellSearchActions } from '../actions';
import {
  TOGGLE_EXPANDED_WELL_ID,
  TOGGLE_SELECTED_WELLS,
  SET_LOG_TYPE,
  SET_LOGS_ROW_DATA,
  SET_WELLBORE_ASSETS,
  SET_WELLBORE_DIGITAL_ROCK_SAMPLES,
  Well,
  TOGGLE_SELECTED_WELLBORE_OF_WELL,
} from '../types';

const getDefaultTestValues = () => {
  const well = getDefaultWell();
  const wellbore = getDefaultWellbore();

  const initialStore: PartialStoreState = getInitialStore();
  const store: AppStore = getMockedStore({
    wellSearch: { ...initialStore.wellSearch },
  });

  return { store, well, wellbore };
};

describe('Well search Actions', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  afterAll(jest.clearAllMocks);

  beforeEach(() => jest.clearAllMocks());

  describe('toggleExpandedWell', () => {
    it(`should toggle expanded well status and reset flag false as default`, async () => {
      const { store, well } = getDefaultTestValues();
      await store.dispatch(wellSearchActions.toggleExpandedWell(well));
      expect(store.getActions()).toEqual([
        {
          type: TOGGLE_EXPANDED_WELL_ID,
          id: well.id,
          reset: false,
        },
      ]);
    });

    it(`should toggle expanded well status and reset flag true`, async () => {
      const { store, well } = getDefaultTestValues();
      await store.dispatch(wellSearchActions.toggleExpandedWell(well, true));
      expect(store.getActions()).toEqual([
        {
          type: TOGGLE_EXPANDED_WELL_ID,
          id: well.id,
          reset: true,
        },
      ]);
    });
  });

  describe('toggleSelectedWells', () => {
    it(`should toggle selected wells status`, async () => {
      const { store } = getDefaultTestValues();
      const well = getMockWell() as unknown as Well;
      const isSelected = true;
      store.dispatch(wellSearchActions.toggleSelectedWells([well], isSelected));
      expect(store.getActions()).toEqual([
        {
          type: TOGGLE_SELECTED_WELLS,
          wells: [well],
          isSelected,
        },
      ]);
    });
  });

  describe('toggleSelectedWellboreOfWell', () => {
    it(`should toggle selected wellbore of well status`, async () => {
      const { store } = getDefaultTestValues();
      const well = getMockWell() as unknown as Well;
      const wellboreId = 'well/test_wellbore_id';
      const isSelected = true;
      store.dispatch(
        wellSearchActions.toggleSelectedWellboreOfWell({
          well,
          wellboreId,
          isSelected,
        })
      );
      expect(store.getActions()).toEqual([
        {
          type: TOGGLE_SELECTED_WELLBORE_OF_WELL,
          well,
          wellboreId,
          isSelected,
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
});
