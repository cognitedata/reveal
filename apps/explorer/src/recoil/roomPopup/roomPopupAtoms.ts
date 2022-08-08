import { OptionType } from '@cognite/cogs.js';
import { atom } from 'recoil';

export type EquipmentSelectOptionType = OptionType<string> & {
  type: string;
  isBroken: boolean;
};

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

export const roomEquipmentSelectAtom = atom<EquipmentSelectOptionType[]>({
  key: 'RoomEquipmentSelect',
  default: [],
});

export const prevRoomEquipmentSelectAtom = atom<EquipmentSelectOptionType[]>({
  key: 'PrevRoomEquipmentSelect',
  default: [],
});

export const prevRoomAtom = atom({
  key: 'PrevRoomNode',
  default: { externalId: '' },
});
