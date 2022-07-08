import { WellInternal } from 'domain/wells/well/internal/types';

import { PartialStoreState } from 'core';
import fetchMock from 'fetch-mock';

import { Asset } from '@cognite/sdk';

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
  SET_WELLBORE_DIGITAL_ROCK_SAMPLES,
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
      const well = getMockWell() as unknown as WellInternal;
      const isSelected = true;
      store.dispatch(
        wellSearchActions.toggleSelectedWells([well], { isSelected })
      );
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
      const well = getMockWell() as unknown as WellInternal;
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

  describe('getDigitalRockSamples', () => {
    it(`should fetch digital rock samples for the given digital rock list`, async () => {
      const { store } = getDefaultTestValues();
      const wellboreId = 123;
      const wellboreAssetIdMap = {
        'wellbore:123': '123',
      };

      const digitalRocks = [
        { id: 123, parentExternalId: 'wellbore:123', parentId: wellboreId },
      ] as Asset[];
      const fetcher: any = () =>
        new Promise((resolve) => {
          resolve([]);
        });

      await store.dispatch(
        wellSearchActions.getDigitalRockSamples(
          digitalRocks,
          wellboreAssetIdMap,
          fetcher
        ) as any
      );
      expect(store.getActions()).toEqual([
        {
          type: SET_WELLBORE_DIGITAL_ROCK_SAMPLES,
          data: [
            {
              wellboreId: String(wellboreId),
              digitalRockId: digitalRocks[0].id,
              digitalRockSamples: [],
            },
          ],
        },
      ]);
    });
  });
});
