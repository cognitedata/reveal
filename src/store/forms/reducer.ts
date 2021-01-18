import { Board } from 'store/suites/types';
import { createReducer } from 'typesafe-actions';
import {
  suiteEmpty,
  key,
  updateSuite,
  deleteBoardFromSuite,
  updatedBoardList,
} from 'utils/forms';
import { FormActionTypes, FormState, FormRootAction } from './types';

const initialState: FormState = {
  isErrorListEmpty: true,
  suite: suiteEmpty,
  board: {},
};

export const FormReducer = createReducer(initialState)
  .handleAction(
    FormActionTypes.SET_IS_ERROR_LIST_EMPTY,
    (state: FormState, action: FormRootAction) => ({
      ...state,
      isErrorListEmpty: action.payload,
    })
  )
  .handleAction(
    FormActionTypes.SET_SUITE,
    (state: FormState, action: FormRootAction) => ({
      ...state,
      suite: action.payload,
    })
  )
  .handleAction(
    FormActionTypes.SET_BOARD,
    (state: FormState, action: FormRootAction) => ({
      ...state,
      board: action.payload,
    })
  )
  .handleAction(FormActionTypes.ADD_BOARD, (state: FormState) => ({
    ...state,
    suite: {
      ...state.suite,
      boards:
        state.suite.boards.concat({
          ...(state.board as Board),
          key: key(),
        }) || [],
    },
  }))
  .handleAction(FormActionTypes.UPDATE_BOARD, (state: FormState) => ({
    ...state,
    suite: updateSuite(state.suite, state.board as Board),
    board: {},
  }))
  .handleAction(
    FormActionTypes.DELETE_BOARD,
    (state: FormState, action: FormRootAction) => ({
      ...state,
      suite: deleteBoardFromSuite(state.suite, action.payload as string),
      board: !(state.board as Board).key
        ? state.board
        : updatedBoardList[0] || {},
    })
  )
  .handleAction(FormActionTypes.CLEAR_FORM, (state: FormState) => ({
    ...state,
    suite: initialState.suite,
    board: initialState.board,
  }));
