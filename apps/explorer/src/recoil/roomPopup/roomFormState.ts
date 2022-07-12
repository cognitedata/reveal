import { Room } from 'graphql/generated';
import { DefaultValue, selector } from 'recoil';
import { nameAtom } from 'recoil/popupShared/nameAtom';
import {
  prevRoomAtom,
  roomDescriptionAtom,
  roomIsBookableAtom,
  roomNodeIdAtom,
} from 'recoil/roomPopup/roomPopupAtoms';

export const roomFormState = selector({
  key: 'RoomFormState',
  get: ({ get }) => {
    const name = get(nameAtom);
    const description = get(roomDescriptionAtom);
    const isBookable = get(roomIsBookableAtom);
    const nodeId = get(roomNodeIdAtom);
    return { name, description, isBookable, nodeId };
  },
  set: ({ set }, newValues: Partial<Room> | DefaultValue) => {
    const isDefaultValue = newValues instanceof DefaultValue;
    if (!isDefaultValue) {
      set(nameAtom, newValues.name || '');
      set(roomDescriptionAtom, newValues.description || '');
      set(roomIsBookableAtom, !!newValues.isBookable);
      set(roomNodeIdAtom, newValues.nodeId);
      set(prevRoomAtom, newValues);
    }
  },
});
