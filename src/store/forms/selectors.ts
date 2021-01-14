import { Suite } from 'store/suites/types';
import { StoreState } from 'store/types';
import { BoardState } from './types';

export const isErrorListEmpty = (state: StoreState): boolean =>
  state.form.isErrorListEmpty;

export const suiteState = (state: StoreState): Suite => state.form.suite;

export const boardState = (state: StoreState): BoardState => state.form.board;
