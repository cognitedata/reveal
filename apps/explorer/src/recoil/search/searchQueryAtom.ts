import { atom } from 'recoil';

export const searchQueryAtom = atom<string>({
  key: 'SearchQuery',
  default: '',
});
