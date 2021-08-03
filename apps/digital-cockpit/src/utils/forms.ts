import omit from 'lodash/omit';
import findIndex from 'lodash/findIndex';
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
  const boardsCopy = [...suite.boards];
  const boardIndex = findIndex(suite.boards, { key: board.key });
  if (boardIndex !== -1) {
    boardsCopy[boardIndex] = board;
  } else {
    boardsCopy.push(board);
  }

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

export const excludeFileFromBoard = (suite: Suite, boardKey: string): Suite => {
  const { boards } = suite;
  const boardUpdated = boards.find((board) => board.key === boardKey);
  boardUpdated && (boardUpdated.imageFileId = '');
  return { ...suite };
};

// modifies existing suite
export const updateBoardWithFileId = (
  suite: Suite,
  fileUploadResult: FileUploadResult
): void => {
  const { boards } = suite;
  const boardUpdated = boards.find(
    (board) => board.key === fileUploadResult.boardKey
  );
  boardUpdated && (boardUpdated.imageFileId = fileUploadResult.fileExternalId);
};
