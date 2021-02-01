import { StoreState } from 'store/types';
import { LastVisited } from 'store/userSpace/types';
import { findLastVisitedTimeByKey } from 'utils/userSpace';
import { Board, ImgUrls, Suite, SuitesTableState } from './types';

export const getSuitesTableState = (state: StoreState): SuitesTableState => {
  const sortedSuites =
    state.suitesTable?.suites?.sort(
      (x: Suite, y: Suite) => x?.createdTime - y?.createdTime
    ) || [];
  return { ...state.suitesTable, suites: sortedSuites };
};

export const getBoardsBySuite = (key: string) => (
  state: StoreState
): Suite | undefined =>
  state.suitesTable.suites?.find((suite) => suite.key === key);

export const getLastVisitedBoards = (
  lastVisited: LastVisited[],
  itemsToDisplay: number = 6
) => (state: StoreState): Board[] => {
  const boards: Board[] = [];
  const keys: string[] = lastVisited.map((item: LastVisited) => item.key);
  if (!keys?.length) {
    return boards;
  }
  state.suitesTable?.suites?.forEach((suite: Suite) => {
    const filtered = suite.boards
      ?.filter((board) => keys.includes(board.key))
      .map((board) => ({
        ...board,
        color: suite.color,
        lastVisitedTime: findLastVisitedTimeByKey(lastVisited, board.key),
      }));

    if (filtered?.length) {
      boards.push(...filtered);
    }
  });
  boards
    .sort(
      (a: Board, b: Board) =>
        ((b.lastVisitedTime as any) as number) -
        ((a.lastVisitedTime as any) as number)
    )
    .splice(itemsToDisplay);
  return boards;
};

export const getImgUrlsState = (state: StoreState): ImgUrls =>
  state.suitesTable.imageUrls;
