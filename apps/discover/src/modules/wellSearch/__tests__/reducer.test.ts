import { Sequence, Asset } from '@cognite/sdk';

import {
  getDefaultWell,
  getDefaultWellbore,
  getDefaultSequence,
  mockedWellResultFixture,
  mockedWellboreResultFixture,
  mockedWellSearchState,
} from '__test-utils/fixtures/well';

import { initialState, wellReducer } from '../reducer';
import {
  RESET_QUERY,
  SET_IS_SEARCHING,
  SET_WELLS_DATA,
  SET_WELLBORES,
  SET_SEQUENCES,
  SET_SELECTED_WELL_ID,
  SET_SELECTED_WELLBORE_IDS,
  SET_SEARCH_PHRASE,
  SET_HAS_SEARCHED,
  TOGGLE_EXPANDED_WELL_ID,
  TOGGLE_SELECTED_WELLS,
  SET_LOG_TYPE,
  SET_LOGS_ROW_DATA,
  SET_WELLBORE_SEQUENCES,
  SET_PPFG_ROW_DATA,
  SET_GEOMECHANIC_ROW_DATA,
  SET_WELLBORE_DIGITAL_ROCK_SAMPLES,
  SET_WELLBORE_ASSETS,
  SET_GRAIN_ANALYSIS_DATA,
  SET_ALL_WELLBORES_FETCHING,
  SET_WELLBORES_FETCHED_WELL_IDS,
  SET_SELECTED_WELLBORE_IDS_WITH_WELL_ID,
  SET_HOVERED_WELL,
  SET_HOVERED_WELLBORE_IDS,
  SET_INSECT_WELLBORES_CONTEXT,
  InspectWellboreContext,
  SET_SELECTED_SECONDARY_WELL_IDS,
  SET_SELECTED_SECONDARY_WELLBORE_IDS,
} from '../types';

describe('Well Reducer', () => {
  it(`should reset query on ${RESET_QUERY}`, () => {
    const state = wellReducer(
      { ...initialState, currentQuery: { phrase: 'test', hasSearched: true } },
      {
        type: RESET_QUERY,
      }
    );
    expect(state).toEqual(initialState);
  });

  it(`should update isSearcing by dispatching ${SET_IS_SEARCHING}`, () => {
    const state = wellReducer(
      { ...initialState, currentQuery: { phrase: 'test', hasSearched: true } },
      {
        type: SET_IS_SEARCHING,
        isSearching: true,
      }
    );
    expect(state.isSearching).toEqual(true);
  });

  it(`should update allWellboresFetching by dispatching ${SET_ALL_WELLBORES_FETCHING}`, () => {
    const state = wellReducer(
      { ...initialState },
      {
        type: SET_ALL_WELLBORES_FETCHING,
        allWellboresFetching: true,
      }
    );
    expect(state.allWellboresFetching).toEqual(true);
  });

  it(`should update wellboresFetchedWellIds by dispatching ${SET_WELLBORES_FETCHED_WELL_IDS}`, () => {
    const wellIds = [getDefaultWell().id];
    const state = wellReducer(
      { ...initialState },
      {
        type: SET_WELLBORES_FETCHED_WELL_IDS,
        wellIds,
      }
    );
    expect(state.wellboresFetchedWellIds).toEqual(wellIds);
  });

  it(`should set wells to the given wells dispatched by ${SET_WELLS_DATA}`, () => {
    const wellData = getDefaultWell();
    const state = wellReducer(
      { ...initialState, currentQuery: { phrase: 'test', hasSearched: true } },
      {
        type: SET_WELLS_DATA,
        wells: [wellData],
      }
    );
    expect(state.wells).toEqual([wellData]);
  });

  it('should expand first well by default', () => {
    const wellData = getDefaultWell();
    const state = wellReducer(
      { ...initialState, currentQuery: { phrase: 'test', hasSearched: true } },
      {
        type: SET_WELLS_DATA,
        wells: [wellData],
      }
    );
    expect(state.expandedWellIds).toEqual({ [wellData.id]: true });
  });

  it(`should update the wellReducer with associated wellbores`, () => {
    const wellData = getDefaultWell();
    const wellboresData = getDefaultWellbore() as any;

    const state = wellReducer(
      { ...initialState, wells: [wellData] },
      {
        type: SET_WELLBORES,
        data: { [wellData.id]: [wellboresData] },
      }
    );
    const updatedWellboreData = {
      ...wellboresData,
      metadata: {
        wellDescription: wellData.description ? wellData.description : '-',
        wellExternalId: wellData.externalId ? wellData.externalId : '-',
        wellName: '16/1',
      },
    };
    expect(
      state.wells.find((well) => well.id === wellData.id)?.wellbores
    ).toEqual([updatedWellboreData]);
  });

  it(`should update the wellbores with associated sequences`, () => {
    const wellData = getDefaultWell();
    const wellboresData = getDefaultWellbore();
    const sequence = getDefaultSequence();
    const state = wellReducer(
      {
        ...initialState,
        wells: [{ ...wellData, wellbores: [{ ...wellboresData }] }],
      },
      {
        type: SET_SEQUENCES,
        wellId: wellData.id,
        wellboreId: wellboresData.id,
        sequences: [sequence],
      }
    );
    const updatedWell = state.wells.find((well) => well.id === wellData.id);
    expect(updatedWell).not.toBeUndefined();
    const updatedWellBore = updatedWell?.wellbores?.find(
      (wellbore) => wellbore.id === wellboresData.id
    );
    expect(updatedWellBore).not.toBeUndefined();
    expect(updatedWellBore?.sequences).toEqual([sequence]);
  });

  it(`should set the selected well id`, () => {
    const wellId = 1241231231;
    const state = wellReducer(undefined, {
      type: SET_SELECTED_WELL_ID,
      id: wellId,
      value: true,
    });
    expect(state.selectedWellIds[wellId]).toBeTruthy();
  });

  it(`should set the selected wellbore id`, () => {
    const wellboreId = 1241231231;
    const state = wellReducer(undefined, {
      type: SET_SELECTED_WELLBORE_IDS,
      ids: { [wellboreId]: true },
    });
    expect(state.selectedWellboreIds[wellboreId]).toBeTruthy();
  });

  it(`should set the selected wellbore id with parent well`, () => {
    const wellId = 1234;
    const wellboreId = 759155409324883;

    const wells = mockedWellResultFixture.map((well) => ({
      ...well,
      wellbores: mockedWellboreResultFixture.filter(
        (wellbore) => wellbore.wellId === well.id
      ),
    }));

    const state = wellReducer(
      {
        ...initialState,
        wells,
      },
      {
        type: SET_SELECTED_WELLBORE_IDS_WITH_WELL_ID,
        ids: { [wellboreId]: true },
        wellId,
      }
    );
    expect(state.selectedWellIds).toEqual({ 1234: true });
    expect(state.selectedWellboreIds).toEqual({ 759155409324883: true });

    const state2 = wellReducer(
      {
        ...initialState,
        wells,
      },
      {
        type: SET_SELECTED_WELLBORE_IDS_WITH_WELL_ID,
        ids: { [wellboreId]: false },
        wellId,
      }
    );

    expect(state2.selectedWellIds).toEqual({ 1234: false });
    expect(state2.selectedWellboreIds).toEqual({ 759155409324883: false });
  });

  it(`should set the search phrase inside currentquery`, () => {
    const phrase = '16/1';
    const state = wellReducer(undefined, {
      type: SET_SEARCH_PHRASE,
      phrase,
    });
    expect(state.currentQuery.phrase).toEqual(phrase);
  });

  it(`should set the hasSearched value`, () => {
    const state = wellReducer(undefined, {
      type: SET_HAS_SEARCHED,
      hasSearched: true,
    });
    expect(state.currentQuery.hasSearched).toEqual(true);
  });

  it(`should toggle expanded well id`, () => {
    const state = wellReducer(undefined, {
      type: TOGGLE_EXPANDED_WELL_ID,
      id: 1234,
    });
    expect(state.expandedWellIds).toEqual({ 1234: true });
  });

  it(`should toggle selected wells, when no filtered wells available all results should selected`, () => {
    const state = wellReducer(
      {
        ...initialState,
        wells: [...mockedWellResultFixture],
      },
      {
        type: TOGGLE_SELECTED_WELLS,
        value: true,
      }
    );
    expect(state.selectedWellIds).toEqual({ 1234: true, 1235: true });
  });

  it(`should set log type data in wellboreData state`, () => {
    const log = { id: 231324234223, name: 'log 1' } as Sequence;
    const wellboreId = 1234;
    const state = wellReducer(
      { ...initialState, wellboreData: {} },
      {
        type: SET_LOG_TYPE,
        data: {
          logs: { [wellboreId]: [log] },
          logsFrmTops: { [wellboreId]: [log] },
        },
      }
    );
    expect(state.wellboreData).toEqual({
      [wellboreId]: {
        logType: [{ sequence: log }],
        logsFrmTops: [{ sequence: log }],
      },
    });
  });

  it(`should set log low data in wellboreData state`, () => {
    const wellboreId = 1234;
    const log = {
      id: 231324234223,
      name: 'log 1',
      assetId: wellboreId,
    } as Sequence;
    const state = wellReducer(
      {
        ...initialState,
        wellboreData: {
          [wellboreId]: {
            logType: [{ sequence: log }],
            logsFrmTops: [{ sequence: log }],
          },
        },
      },
      {
        type: SET_LOGS_ROW_DATA,
        data: {
          logs: [{ log, rows: [] }],
          logsFrmTops: [{ log, rows: [] }],
        },
      }
    );
    expect(state.wellboreData).toEqual({
      [wellboreId]: {
        logType: [{ sequence: log, rows: [] }],
        logsFrmTops: [{ sequence: log, rows: [] }],
      },
    });
  });

  it(`should set sequences in wellboreData state`, () => {
    const ppfg = { id: 231324234223, name: 'PPFG 1' } as Sequence;
    const wellboreId = 1234;
    const state = wellReducer(
      { ...initialState, wellboreData: {} },
      {
        type: SET_WELLBORE_SEQUENCES,
        data: { [wellboreId]: [ppfg] },
        sequenceType: 'ppfg',
      }
    );
    expect(state.wellboreData).toEqual({
      [wellboreId]: {
        ppfg: [{ sequence: ppfg }],
      },
    });
  });

  it(`should set ppfg row data in wellboreData state`, () => {
    const wellboreId = 1234;
    const ppfg = {
      id: 231324234223,
      name: 'ppfg 1',
      assetId: wellboreId,
    } as Sequence;
    const state = wellReducer(
      {
        ...initialState,
        wellboreData: {
          [wellboreId]: {
            ppfg: [{ sequence: ppfg }],
          },
        },
      },
      {
        type: SET_PPFG_ROW_DATA,
        data: [{ sequence: ppfg, rows: [] }],
      }
    );
    expect(state.wellboreData).toEqual({
      [wellboreId]: {
        ppfg: [{ sequence: ppfg, rows: [] }],
      },
    });
  });

  it(`should set geomechanic row data in wellboreData state`, () => {
    const wellboreId = 1234;
    const geomechanic = {
      id: 231324234223,
      name: 'geomechanic 1',
      assetId: wellboreId,
    } as Sequence;
    const state = wellReducer(
      {
        ...initialState,
        wellboreData: {
          [wellboreId]: {
            geomechanic: [{ sequence: geomechanic }],
          },
        },
      },
      {
        type: SET_GEOMECHANIC_ROW_DATA,
        data: [{ sequence: geomechanic, rows: [] }],
      }
    );
    expect(state.wellboreData).toEqual({
      [wellboreId]: {
        geomechanic: [{ sequence: geomechanic, rows: [] }],
      },
    });
  });

  it(`should set assets in wellboreData state`, () => {
    const asset = { id: 231324234223, name: 'Asset 1' } as Asset;
    const assetType = 'digitalRocks';
    const wellboreId = 1234;
    const state = wellReducer(
      { ...initialState, wellboreData: {} },
      {
        type: SET_WELLBORE_ASSETS,
        data: { [wellboreId]: [asset] },
        assetType,
      }
    );
    expect(state.wellboreData).toEqual({
      [wellboreId]: {
        [assetType]: [{ asset }],
      },
    });
  });

  it(`should set digital rocks samples in the state`, () => {
    const assetType = 'digitalRocks';
    const digitalRock = { id: 111, name: 'Digital Rock 1' } as Asset;
    const digitalRockSamples = [
      { id: 222, parentId: 111, name: 'Digital Rock 1' } as Asset,
    ];
    const wellboreId = 123;
    const state = wellReducer(
      {
        ...initialState,
        wellboreData: {
          [wellboreId]: { [assetType]: [{ asset: digitalRock }] },
        },
      },
      {
        type: SET_WELLBORE_DIGITAL_ROCK_SAMPLES,
        data: [
          {
            wellboreId,
            digitalRockId: digitalRock.id,
            digitalRockSamples,
          },
        ],
      }
    );
    expect(state.wellboreData).toEqual({
      [wellboreId]: {
        [assetType]: [
          {
            asset: digitalRock,
            digitalRockSamples: digitalRockSamples.map((digitalRockSample) => ({
              asset: digitalRockSample,
            })),
          },
        ],
      },
    });
  });

  it(`should set grain analysis data in digital rocks samples`, () => {
    const assetType = 'digitalRocks';
    const wellboreId = 123;
    const digitalRock = {
      id: 111,
      name: 'Digital Rock 1',
      parentId: wellboreId,
    } as Asset;

    const digitalRockSample: any = {
      id: 222,
      parentId: digitalRock.id,
      name: 'Digital Rock 1',
      metadata: {
        wellboreId,
      },
    };
    const state = wellReducer(
      {
        ...initialState,
        wellboreData: {
          [wellboreId]: {
            [assetType]: [
              {
                asset: digitalRock,
                digitalRockSamples: [
                  {
                    asset: digitalRockSample,
                  },
                ],
              },
            ],
          },
        },
      },
      {
        type: SET_GRAIN_ANALYSIS_DATA,
        grainAnalysisType: 'gpart',
        digitalRockSample,
        data: [],
      }
    );

    expect(state.wellboreData).toEqual({
      [wellboreId]: {
        [assetType]: [
          {
            asset: digitalRock,
            digitalRockSamples: [
              {
                asset: digitalRockSample,
                gpart: [],
              },
            ],
          },
        ],
      },
    });
  });

  it(`should set hovered well id to state`, () => {
    const wellData = getDefaultWell(true);

    const state = wellReducer(
      { ...initialState, wells: [wellData] },
      {
        type: SET_HOVERED_WELL,
        wellId: wellData.id,
      }
    );
    expect(state.hoveredWellId).toEqual(wellData.id);
  });

  it(`should set all wellbores of hovered well to state`, () => {
    const wellData = getDefaultWell(true);

    const state = wellReducer(
      { ...initialState, ...mockedWellSearchState },
      {
        type: SET_HOVERED_WELLBORE_IDS,
        wellId: wellData.id,
      }
    );
    expect(state.hoveredWellboreIds[mockedWellboreResultFixture[0].id]).toEqual(
      true
    );
    expect(state.hoveredWellboreIds[mockedWellboreResultFixture[1].id]).toEqual(
      true
    );
  });

  it(`should set one wellbores hovered well to state`, () => {
    const wellData = getDefaultWell(true);

    const state = wellReducer(
      { ...initialState, ...mockedWellSearchState },
      {
        type: SET_HOVERED_WELLBORE_IDS,
        wellId: wellData.id,
        wellboreId: mockedWellboreResultFixture[0].id,
      }
    );
    expect(state.hoveredWellboreIds[mockedWellboreResultFixture[0].id]).toEqual(
      true
    );
  });

  it(`should set inspect wellbore context to checked wellbores`, () => {
    const state = wellReducer(
      { ...initialState },
      {
        type: SET_INSECT_WELLBORES_CONTEXT,
        context: InspectWellboreContext.CHECKED_WELLBORES,
      }
    );
    expect(state.inspectWellboreContext).toEqual(
      InspectWellboreContext.CHECKED_WELLBORES
    );
  });

  it(`should set the selected secondary well id`, () => {
    const wellId = 1241231231;
    const state = wellReducer(undefined, {
      type: SET_SELECTED_SECONDARY_WELL_IDS,
      ids: { [wellId]: true },
      reset: true,
    });
    expect(state.selectedSecondaryWellIds[wellId]).toBeTruthy();
  });

  it(`should set the selected secondary wellbore id`, () => {
    const wellboreId = 1241231231;
    const state = wellReducer(undefined, {
      type: SET_SELECTED_SECONDARY_WELLBORE_IDS,
      ids: { [wellboreId]: true },
    });
    expect(state.selectedSecondaryWellboreIds[wellboreId]).toBeTruthy();
  });
});
