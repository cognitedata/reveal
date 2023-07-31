import { getMockWellbore } from 'domain/wells/wellbore/internal/__fixtures/getMockWellbore';

import { getMockWell } from '__test-utils/fixtures/well';

import { initialState, wellInspect } from '../reducer';
import {
  SET_COLORED_WELLBORES,
  SET_GO_BACK_NAVIGATION_PATH,
  SET_PREREQUISITE_DATA,
  SET_SELECTED_RELATED_DOCUMENT_COLUMNS,
  TOGGLE_SELECTED_WELL,
  TOGGLE_SELECTED_WELLBORE_OF_WELL,
} from '../types';

describe('Well inspect Reducer', () => {
  it(`should set well inspect prerequisite data`, () => {
    const wellIds = ['well1', 'well2', 'well3'];
    const wellboreIds = [
      'well1/wellbore1',
      'well1/wellbore2',
      'well2/wellbore1',
    ];
    const state = wellInspect(initialState, {
      type: SET_PREREQUISITE_DATA,
      payload: { wellIds, wellboreIds },
    });
    expect(state.selectedWellIds).toEqual({
      well1: true,
      well2: true,
      well3: true,
    });
    expect(state.selectedWellboreIds).toEqual({
      'well1/wellbore1': true,
      'well1/wellbore2': true,
      'well2/wellbore1': true,
    });
  });

  it(`should toggle selected well`, () => {
    const well = getMockWell({
      id: 'well',
      wellbores: [
        getMockWellbore({ id: 'well/wellbore1' }),
        getMockWellbore({ id: 'well/wellbore2' }),
      ],
    });
    const isSelected = true;
    const state = wellInspect(initialState, {
      type: TOGGLE_SELECTED_WELL,
      payload: { well, isSelected },
    });
    expect(state.selectedWellIds).toEqual({ well: isSelected });
    expect(state.selectedWellboreIds).toEqual({
      'well/wellbore1': isSelected,
      'well/wellbore2': isSelected,
    });
  });

  it(`should toggle selected wellbore of well`, () => {
    const well = getMockWell({
      id: 'well',
      wellbores: [
        getMockWellbore({ id: 'well/wellbore1' }),
        getMockWellbore({ id: 'well/wellbore2' }),
      ],
    });
    const wellboreId = 'well/wellbore1';

    const stateBeforeToggle = wellInspect(initialState, {
      type: TOGGLE_SELECTED_WELL,
      payload: { well, isSelected: true },
    });
    const stateAfterToggle = wellInspect(stateBeforeToggle, {
      type: TOGGLE_SELECTED_WELLBORE_OF_WELL,
      payload: { well, wellboreId, isSelected: false },
    });

    expect(stateAfterToggle.selectedWellIds).toEqual({ well: true });
    expect(stateAfterToggle.selectedWellboreIds).toEqual({
      'well/wellbore1': false,
      'well/wellbore2': true,
    });
  });

  it(`should set go back navigation path`, () => {
    const pathname = '/discover/wellSearch';
    const state = wellInspect(initialState, {
      type: SET_GO_BACK_NAVIGATION_PATH,
      payload: pathname,
    });
    expect(state.goBackNavigationPath).toEqual(pathname);
  });

  it(`should set selected related documents columns`, () => {
    const payload = { fileName: true };
    const state = wellInspect(undefined, {
      type: SET_SELECTED_RELATED_DOCUMENT_COLUMNS,
      payload,
    });
    expect(state.selectedRelatedDocumentsColumns.fileName).toBeTruthy();
  });

  it(`should set colored wellbores`, () => {
    const state = wellInspect(initialState, {
      type: SET_COLORED_WELLBORES,
      payload: true,
    });
    expect(state.coloredWellbores).toEqual(true);
  });
});
