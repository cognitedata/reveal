import { StoreState } from 'store/types';
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

export const getLastVisitedBoards = (
  keys: string[],
  itemsToDisplay: number = 6
) => (state: StoreState): Board[] => {
  const boards: Board[] = [];
  if (!keys?.length) {
    return boards;
  }
  // eslint-disable-next-line no-unused-expressions
  state.suitesTable?.suites?.forEach((suite: Suite) => {
    const filtered = suite.boards?.filter((board) => keys.includes(board.key));
    if (filtered?.length) {
      boards.push(...filtered);
    }
  });
  boards.splice(itemsToDisplay);
  return boards;
};
