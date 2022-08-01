import { atom } from 'recoil';

export const floorLayerIndexState = atom<number>({
  key: 'floorLayerIndexState',
  default: 0,
});
