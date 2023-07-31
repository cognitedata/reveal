import { FavoriteSummary } from 'modules/favorite/types';

export type ModalType = 'Delete' | 'Create' | 'Share' | 'Edit';
export type RowType = {
  row: {
    original: FavoriteSummary;
  };
};
