import { atom } from 'recoil';

export const roomDescriptionAtom = atom({
  key: 'RoomDescription',
  default: '',
});

export const roomIsBookableAtom = atom({
  key: 'RoomIsBookable',
  default: false,
});

export const roomNodeIdAtom = atom({
  key: 'RoomNodeId',
  default: 0,
});

export const prevRoomAtom = atom({
  key: 'PrevRoomNode',
  default: {},
});
