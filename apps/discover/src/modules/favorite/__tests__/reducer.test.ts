import { favourite } from '../reducer';
import {
  HIDE_CREATE_MODAL,
  SET_ITEMS_TO_ADD_AFTER_FAVORITE_CREATION,
  SHOW_CREATE_MODAL,
} from '../types';

describe('favourite reducer', () => {
  const getInitialState: any = () => {
    const initialState = {
      isCreateModalVisible: false,
      viewMode: 1,
    };
    return { initialState };
  };

  test(`should open create modal`, () => {
    const { initialState } = getInitialState();
    const state = favourite(initialState, {
      type: SHOW_CREATE_MODAL,
    });
    expect(state.isCreateModalVisible).toBeTruthy();
  });

  test(`should hide create modal`, () => {
    const { initialState } = getInitialState();
    const state = favourite(initialState, {
      type: HIDE_CREATE_MODAL,
    });
    expect(state.isCreateModalVisible).toBeFalsy();
  });

  test(`should set items to add after creation correctly`, () => {
    const { initialState } = getInitialState();
    const state = favourite(initialState, {
      type: SET_ITEMS_TO_ADD_AFTER_FAVORITE_CREATION,
      payload: {
        documentIds: [1],
        wells: { 1: [] },
      },
    });
    expect(state.itemsToAddAfterFavoriteCreation).toEqual({
      documentIds: [1],
      wells: { 1: [] },
    });
  });

  test(`should set items to add after creation to undefined`, () => {
    const initialState = { ...getInitialState(), lastCreatedSetId: '1234' };
    const state = favourite(initialState, {
      type: SET_ITEMS_TO_ADD_AFTER_FAVORITE_CREATION,
      payload: undefined,
    });
    expect(state.itemsToAddAfterFavoriteCreation).toBeUndefined();
  });
});
