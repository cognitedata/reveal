import { FavoriteSummary } from 'modules/favorite/types';

export type FavoriteStatus = 'error' | 'loading' | 'ok';

export interface FavoriteSet {
  status: FavoriteStatus;
  favorites: FavoriteSummary[];
}
