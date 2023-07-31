import { PartialStoreState } from 'core';
import fetchMock from 'fetch-mock';

import { mockedWellsFixture } from '__test-utils/fixtures/well';
import { getMockedStore, getInitialStore } from '__test-utils/store.utils';
import { AppStore } from '__test-utils/types';

import { wellInspectActions } from '../actions';
import {
  SET_COLORED_WELLBORES,
  SET_GO_BACK_NAVIGATION_PATH,
  SET_PREREQUISITE_DATA,
  SET_SELECTED_RELATED_DOCUMENT_COLUMNS,
  TOGGLE_SELECTED_WELL,
  TOGGLE_SELECTED_WELLBORE_OF_WELL,
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

describe('Well inspect Actions', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  afterAll(jest.clearAllMocks);
  beforeEach(() => jest.clearAllMocks());

  it(`should set well inspect prerequisite data`, async () => {
    const { store } = getDefaultTestValues();
    const wellIds = ['well1', 'well2', 'well3'];
    const wellboreIds = [
      'well1/wellbore1',
      'well1/wellbore2',
      'well2/wellbore1',
    ];
    await store.dispatch(
      wellInspectActions.setPrerequisiteData({ wellIds, wellboreIds })
    );
    expect(store.getActions()).toEqual([
      {
        type: SET_PREREQUISITE_DATA,
        payload: { wellIds, wellboreIds },
      },
    ]);
  });

  it(`should toggle selected well`, async () => {
    const { store } = getDefaultTestValues();
    const well = mockedWellsFixture[0];
    const isSelected = true;
    await store.dispatch(
      wellInspectActions.toggleSelectedWell({ well, isSelected })
    );
    expect(store.getActions()).toEqual([
      {
        type: TOGGLE_SELECTED_WELL,
        payload: { well, isSelected },
      },
    ]);
  });

  it(`should toggle selected wellbore of well`, async () => {
    const { store } = getDefaultTestValues();
    const well = mockedWellsFixture[0];
    const wellboreId = well.wellbores[0].id;
    const isSelected = true;
    await store.dispatch(
      wellInspectActions.toggleSelectedWellboreOfWell({
        well,
        wellboreId,
        isSelected,
      })
    );
    expect(store.getActions()).toEqual([
      {
        type: TOGGLE_SELECTED_WELLBORE_OF_WELL,
        payload: { well, wellboreId, isSelected },
      },
    ]);
  });

  it(`should set go back navigation path`, async () => {
    const { store } = getDefaultTestValues();
    const pathname = '/discover/wellSearch';
    await store.dispatch(wellInspectActions.setGoBackNavigationPath(pathname));
    expect(store.getActions()).toEqual([
      {
        type: SET_GO_BACK_NAVIGATION_PATH,
        payload: pathname,
      },
    ]);
  });

  it(`should set selected related documents columns`, async () => {
    const { store } = getDefaultTestValues();
    const payload = { fileName: true, source: true };
    await store.dispatch(
      wellInspectActions.setSelectedRelatedDocumentColumns(payload)
    );
    expect(store.getActions()).toEqual([
      {
        type: SET_SELECTED_RELATED_DOCUMENT_COLUMNS,
        payload,
      },
    ]);
  });

  it(`should set colored wellbores`, async () => {
    const { store } = getDefaultTestValues();
    await store.dispatch(wellInspectActions.setColoredWellbores(true));
    expect(store.getActions()).toEqual([
      {
        type: SET_COLORED_WELLBORES,
        payload: true,
      },
    ]);
  });
});
