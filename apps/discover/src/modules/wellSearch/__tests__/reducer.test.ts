import { Sequence, Asset } from '@cognite/sdk';

import { mockedWellsFixture } from '__test-utils/fixtures/well';

import { initialState, wellReducer } from '../reducer';
import {
  TOGGLE_EXPANDED_WELL_ID,
  TOGGLE_SELECTED_WELLS,
  TOGGLE_SELECTED_WELLBORE_OF_WELL,
  SET_LOG_TYPE,
  SET_LOGS_ROW_DATA,
  SET_WELLBORE_DIGITAL_ROCK_SAMPLES,
  SET_WELLBORE_ASSETS,
  SET_GRAIN_ANALYSIS_DATA,
} from '../types';

describe('Well Reducer', () => {
  it(`should toggle expanded well id and should not reset expandedWellIds`, () => {
    const state = wellReducer(
      {
        ...initialState,
        expandedWellIds: {
          1234: true,
          1235: true,
        },
      },
      {
        type: TOGGLE_EXPANDED_WELL_ID,
        id: 1235,
        reset: false,
      }
    );
    expect(state.expandedWellIds).toEqual({
      1234: true,
      1235: false,
    });
  });

  it(`should toggle expanded well id and reset expandedWellIds`, () => {
    const state = wellReducer(
      {
        ...initialState,
        expandedWellIds: {
          1234: true,
          1235: false,
        },
      },
      {
        type: TOGGLE_EXPANDED_WELL_ID,
        id: 1235,
        reset: true,
      }
    );
    expect(state.expandedWellIds).toEqual({ 1235: true });
  });

  it(`should toggle selected wells, when no filtered wells available all results should selected`, () => {
    const state = wellReducer(initialState, {
      type: TOGGLE_SELECTED_WELLS,
      wells: mockedWellsFixture,
      isSelected: true,
    });
    expect(state.selectedWellIds).toEqual({ 1234: true, 1235: true });
  });

  it('should clear all the selected wells and wellbores', () => {
    const state = wellReducer(initialState, {
      type: TOGGLE_SELECTED_WELLS,
      wells: mockedWellsFixture,
      isSelected: true,
      clear: true,
    });

    expect(state.selectedWellIds).toEqual({});
    expect(state.selectedWellboreIds).toEqual({});
  });

  it(`should toggle selected wellbore of well`, () => {
    const well = mockedWellsFixture[0];
    const state = wellReducer(initialState, {
      type: TOGGLE_SELECTED_WELLBORE_OF_WELL,
      well,
      wellboreId: well.wellbores[0].id,
      isSelected: true,
    });
    expect(state.selectedWellIds).toEqual({ 1234: true });
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
});
