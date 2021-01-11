import { StoreState } from 'store/types';
import { LastVisited } from 'store/userSpace/types';
import { sortByLastUpdated } from 'utils/suites';
import { Board, Suite, SuitesTableState } from './types';

export const getSuitesTableState = (state: StoreState): SuitesTableState =>
  state.suitesTable;

export const getBoardsBySuite = (key: string) => (
  state: StoreState
): Suite | undefined =>
  state.suitesTable.suites?.find((suite) => suite.key === key);

export const getLastVisitedSuitesMock = (itemsToDisplay: number = 6) => (
  state: StoreState
): Suite[] | undefined =>
  sortByLastUpdated(state.suitesTable?.suites || [], 'desc').slice(
    0,
    itemsToDisplay
  );

// changed logic, discuss with Max
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
      .map((board) => ({ ...board, color: suite.color }));

    if (filtered?.length) {
      boards.push(...filtered);
    }
  });
  const newList: Board[] = [];
  boards.forEach((board) => {
    lastVisited.forEach((item) => {
      if (board.key === item.key) {
        newList.push({ ...board, lastVisitedTime: item.lastVisitedTime });
      }
    });
  });
  newList
    .sort(
      (a: Board, b: Board) =>
        ((b.lastVisitedTime as any) as number) -
        ((a.lastVisitedTime as any) as number)
    )
    .splice(itemsToDisplay);
  return newList;
};
