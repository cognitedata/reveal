import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import merge from 'lodash/merge';
import { Board, Suite } from 'store/suites/types';
import { now } from 'utils/date';

export const key = () => `_${Math.random().toString(36).substr(2, 9)}`;

export const suiteEmpty = {
  key: key(),
  title: '',
  description: '',
  color: '',
  createdTime: now(),
  boards: [],
};
export const updatedBoardList: Board[] = [];

export const updateSuite = (suite: Suite, board: Board) => {
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

export const deleteBoardFromSuite = (suite: Suite, boardKey: string) => {
  updatedBoardList.splice(0, updatedBoardList.length);
  const filtered = suite.boards.filter((item) => item.key !== boardKey);
  if (filtered?.length) {
    updatedBoardList.push(...filtered);
  }
  return {
    ...suite,
    boards: updatedBoardList,
  };
};
