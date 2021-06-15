import omit from 'lodash/omit';
import { Board, Suite } from 'store/suites/types';

export function filterSuitesByGroups(
  suites: Suite[],
  groupFilter: string[]
): Suite[] {
  if (!groupFilter.length) {
    return [];
  }
  return suites
    .map((suite: Suite) => ({
      ...suite,
      boards: filterOutBoards(suite.boards, groupFilter),
    }))
    .filter((suite: Suite) => !!suite.boards.length);
}

function filterOutBoards(boards: Board[] = [], groupFilter: string[]): Board[] {
  return boards
    .filter(
      (board) =>
        !!board.visibleTo?.some((visibleToGroup) =>
          groupFilter.includes(visibleToGroup)
        )
    )
    .map((board) => omit(board, 'visibleTo'));
}
