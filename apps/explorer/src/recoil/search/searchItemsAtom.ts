import { atom } from 'recoil';
import { SearchDataFormat } from 'utils/search/types';

export const searchItemsAtom = atom<SearchDataFormat[]>({
  key: 'SearchItem',
  default: [],
});
