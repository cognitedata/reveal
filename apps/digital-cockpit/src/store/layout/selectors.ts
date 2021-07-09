import find from 'lodash/find';
import matchesProperty from 'lodash/matchesProperty';
import { Board } from 'store/suites/types';
import { StoreState } from 'store/types';
import { makeDefaultBoardLayout } from 'utils/layout';
import { createSelector } from 'reselect';
import { LayoutState, BoardLayoutPayloadItem, GridLayout } from './types';

export const getLayoutState = (state: StoreState): LayoutState => state.layout;

export const getBoardsGridLayoutItems = (suiteBoards: Board[] | undefined) =>
  createSelector(
    [(_) => suiteBoards, getLayoutState],
    (boards, { layouts }): GridLayout => {
      // get layouts for current boards set (a suite)
      const filteredLayouts = layouts.filter(
        ({ key }) => find(boards, matchesProperty('key', key)) // eslint-disable-line
      );

      const result: GridLayout = {};

      boards?.forEach(({ key, type }) => {
        const item = find(
          filteredLayouts,
          matchesProperty('key', key) // eslint-disable-line
        ) as BoardLayoutPayloadItem;
        result[key] = item?.layout || makeDefaultBoardLayout(type);
      });

      return result;
    }
  );
