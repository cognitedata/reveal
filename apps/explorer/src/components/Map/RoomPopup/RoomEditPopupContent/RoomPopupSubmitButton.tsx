import { useRoomMutate } from 'domain/node/internal/actions/room/useRoomMutate';
import { useUpdateRoomEquipment } from 'domain/node/internal/actions/room/useUpdateRoomEquipment';

import { Room } from 'graphql/generated';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  prevRoomAtom,
  prevRoomEquipmentSelectAtom,
  roomEquipmentSelectAtom,
} from 'recoil/roomPopup/roomPopupAtoms';
import { roomFormState } from 'recoil/roomPopup/roomFormState';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';
import { FullWidthButton } from 'components/Map/elements';
import React from 'react';

export const RoomPopupSubmitButton: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const roomState = useRecoilValue(roomFormState);
  const prevRoom = useRecoilValue(prevRoomAtom);
  const oldEquipmentList = useRecoilValue(prevRoomEquipmentSelectAtom);
  const selectedEquipmentList = useRecoilValue(roomEquipmentSelectAtom);

  const setIsEditMode = useSetRecoilState(isEditModeAtom);
  const updateRoom = useRoomMutate();
  const updateRoomEquipment = useUpdateRoomEquipment();

  const onSubmit = async (newFields: Partial<Room>) => {
    await updateRoom({ ...prevRoom, ...newFields });
    await updateRoomEquipment(oldEquipmentList, selectedEquipmentList);
    setIsEditMode(false);
  };

  const handleSubmit = () => {
    onSubmit(roomState);
  };

  return (
    <FullWidthButton onClick={handleSubmit} type="primary">
      {children}
    </FullWidthButton>
  );
};
