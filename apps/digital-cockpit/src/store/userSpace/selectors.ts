import { StoreState } from 'store/types';
import { createSelector } from 'reselect';
import { getSuites } from 'store/suites/selectors';
import { ApplicationItem } from 'store/config/types';
import { Suite } from 'store/suites/types';
import { findLastVisitedTimeByKey } from 'utils/userSpace';
import { LastVisitedItem } from 'store/userSpace/types';

import { LastVisited, UserSpaceState } from './types';

export const getUserSpace = (state: StoreState): UserSpaceState =>
  state.userSpace;

export const getLastVisited = (state: StoreState): LastVisited[] | undefined =>
  state.userSpace?.lastVisited;

export const getLastVisitedItems = (applications: ApplicationItem[]) =>
  createSelector(
    [getLastVisited, getSuites],
    (
      lastVisited: LastVisited[] | undefined = [],
      suites: Suite[] | null = []
    ): any[] => {
      const boardItems: LastVisitedItem[] = [];
      const keys: string[] = lastVisited.map((item: LastVisited) => item.key);
      if (!keys?.length) {
        return boardItems;
      }
      suites?.forEach((suite: Suite) => {
        const filtered = suite.boards
          ?.filter((board) => keys.includes(board.key))
          .map((board) => ({
            ...board,
            lastVisitedTime: findLastVisitedTimeByKey(lastVisited, board.key),
            itemType: 'board' as const,
          }));

        if (filtered?.length) {
          boardItems.push(...filtered);
        }
      });

      const lastVisitedItems = boardItems
        .concat(
          applications
            .filter((app) => keys.includes(app.key))
            .map((app) => ({
              ...app,
              lastVisitedTime: findLastVisitedTimeByKey(lastVisited, app.key),
              itemType: 'application',
            }))
        )
        .sort(
          (a: LastVisitedItem, b: LastVisitedItem) =>
            (b.lastVisitedTime as any as number) -
            (a.lastVisitedTime as any as number)
        );
      return lastVisitedItems;
    }
  );
