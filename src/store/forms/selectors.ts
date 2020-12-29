import { StoreState } from 'store/types';

export const isErrorListEmpty = (state: StoreState): boolean =>
  state.form.isErrorListEmpty;
