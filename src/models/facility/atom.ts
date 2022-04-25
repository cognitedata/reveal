import { atom, AtomEffect } from 'recoil';

const localStorageEffect =
  (key: string): AtomEffect<string> =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
      isReset
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, JSON.stringify(newValue));
    });
  };

export const facilityAtom = atom<string>({
  key: 'facilityAtom',
  default: '',
  effects: [localStorageEffect('CHARTS_SELECTED_ROOT_ASSET_EXTERNAL_ID')],
});
