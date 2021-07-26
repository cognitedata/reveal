import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import { Board, Suite } from 'store/suites/types';
import { FileUploadResult } from 'store/forms/types';

export const key = () => `_${Math.random().toString(36).substr(2, 9)}`;

export const getEmptySuite = (order = -1) => ({
  key: key(),
  title: '',
  description: '',
  color: '',
  order,
  boards: [],
});

export const updateSuite = (suite: Suite, board: Board) => {
  const boardIndex = suite.boards.findIndex((element: Board) =>
    isEqual(element.key, board.key)
  );
  const boardsCopy = cloneDeep(suite.boards);
  boardsCopy[boardIndex] = board;
  return omit(
    {
      ...suite,
      boards: boardsCopy,
    },
    'lastUpdatedTime'
  );
};

export const deleteBoardFromSuite = (suite: Suite, boardKey: string) => {
  return {
    ...suite,
    boards: suite.boards?.filter((board) => board.key !== boardKey),
  };
};

export const updateBoardWithFileId = (
  suite: Suite,
  fileUploadResult: FileUploadResult
): Suite => {
  const { boards } = suite;
  const boardUpdated = boards.find(
    (board) => board.key === fileUploadResult.boardKey
  );
  boardUpdated && (boardUpdated.imageFileId = fileUploadResult.fileExternalId);
  return suite;
};
