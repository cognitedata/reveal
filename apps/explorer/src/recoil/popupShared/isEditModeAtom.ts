import { atom } from 'recoil';

export const isEditModeAtom = atom({
  key: 'EditMode',
  default: false,
});
