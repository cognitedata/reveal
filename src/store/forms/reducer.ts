import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import merge from 'lodash/merge';
import { Board, Suite } from 'store/suites/types';
import { createReducer } from 'typesafe-actions';
import { key } from 'utils/generateKey';
import { FormActionTypes, FormState, FormRootAction } from './types';

// ask Max about correct place for this obj, should it be utils?
const suiteEmpty = {
  key: key(),
  title: '',
  description: '',
  color: '',
  boards: [],
};

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
      boards: state.suite.boards.concat({
        ...(state.board as Board),
        key: key(),
      }),
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
  .handleAction(FormActionTypes.CLEAR_SUITE, (state: FormState) => ({
    ...state,
    suite: initialState.suite,
  }))
  .handleAction(FormActionTypes.CLEAR_BOARD, (state: FormState) => ({
    ...state,
    board: initialState.board,
  }));

// should I move it to utils or smth similar?
const updateSuite = (suite: Suite, board: Board) => {
  const boardIndex = suite.boards.findIndex((element: Board) =>
    isEqual(element.key, board.key)
  );
  const boardsCopy = cloneDeep(suite.boards);
  boardsCopy[boardIndex] = merge(boardsCopy[boardIndex], board);
  return omit(
    {
      ...suite,
      boards: boardsCopy,
    },
    'lastUpdatedTime'
  );
};

let updatedBoardList: Board[] = [];
const deleteBoardFromSuite = (suite: Suite, boardKey: string) => {
  updatedBoardList = suite.boards.filter((item) => item.key !== boardKey);
  return {
    ...suite,
    boards: updatedBoardList,
  };
};
