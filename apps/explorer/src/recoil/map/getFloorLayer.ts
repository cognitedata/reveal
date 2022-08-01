import { selector } from 'recoil';

import { floorArray } from './constants';
import { floorLayerIndexState } from './layerAtom';

export const getFloorLayer = selector({
  key: 'GetFloorLayer',
  get: ({ get }) => {
    const index = get(floorLayerIndexState);
    return floorArray[index];
  },
});
