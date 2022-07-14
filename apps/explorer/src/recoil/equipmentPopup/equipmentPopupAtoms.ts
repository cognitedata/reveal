import { atom } from 'recoil';

export const equipmentTypeAtom = atom({
  key: 'EquipmentType',
  default: '',
});

export const equipmentIsBrokenAtom = atom({
  key: 'EquipmentIsBroken',
  default: false,
});

export const equipmentNodeIdAtom = atom({
  key: 'EquipmentNodeId',
  default: 0,
});

export const equipmentPersonAtom = atom({
  key: 'EquipmentPerson',
  default: {
    externalId: '',
    name: '',
  },
});

export const prevEquipmentAtom = atom({
  key: 'PrevEquipmentNode',
  default: { externalId: '' },
});
