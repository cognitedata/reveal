import { feedback } from '../reducer';
import { ADD, ADDING, SET_ITEM, GET_ALL_GENERAL } from '../types';

describe('feedback reducer', () => {
  test('returns initial state', () => {
    expect(feedback(undefined, {})).toBeDefined();
  });

  test(`Reducer key: ${ADD}`, () => {
    const state = feedback(undefined, { type: ADD });
    expect(state.isLoading).toBe(false);
  });

  test(`Reducer key: ${ADDING}`, () => {
    const state = feedback(undefined, { type: ADDING });
    expect(state.isLoading).toBe(true);
  });

  test(`Reducer key: ${SET_ITEM}`, () => {
    const state = feedback(undefined, {
      type: SET_ITEM,
      item: {},
    });
    expect(state.item).toEqual({});
  });

  // GENERAL FEEDBACK
  it('Should get general feedback when passed GET_ALL_GENERAL', () => {
    const initialState = {
      generalFeedback: null,
      numberGeneralFeedback: 0,
      pagesGeneralFeedback: 1,
    };
    const action = {
      type: GET_ALL_GENERAL,
      items: {
        generalFeedbacks: [
          { id: 1, comment: 'Great!!!' },
          { id: 2, comment: 'Horrible!!!' },
        ],
        nResults: 112,
        pageCountTotal: 15,
      },
    };
    const state = feedback(initialState, action);
    expect(state.generalFeedback).toEqual([
      { id: 1, comment: 'Great!!!' },
      { id: 2, comment: 'Horrible!!!' },
    ]);
    expect(state.numberGeneralFeedback).toEqual(112);
    expect(state.pagesGeneralFeedback).toEqual(15);
  });
});
