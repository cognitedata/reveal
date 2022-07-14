import { MAP_OBJECTS } from 'components/Map/BlankPopup/constants';
import { atom } from 'recoil';

export const selectedTypeAtom = atom({
  key: 'SelectedType',
  default: {
    value: MAP_OBJECTS.EQUIPMENT,
    label: 'Equipment',
  },
});

export const selectedSubTypeAtom = atom({
  key: 'SelectedSubType',
  default: {
    label: 'TV',
    value: 'tv',
  },
});

export const newNodeIdAtom = atom({
  key: 'NewNodeId',
  default: undefined,
});

export const newExternalIdAtom = atom({
  key: 'NewExternalId',
  default: '',
});
