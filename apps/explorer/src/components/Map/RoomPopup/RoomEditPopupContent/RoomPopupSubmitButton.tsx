import { useRoomMutate } from 'domain/node/internal/actions/room/useRoomMutate';

import { Button } from '@cognite/cogs.js';
import { Room } from 'graphql/generated';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { prevRoomAtom } from 'recoil/roomPopup/roomPopupAtoms';
import { roomFormState } from 'recoil/roomPopup/roomFormState';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';

export const RoomPopupSubmitButton = () => {
  const roomState = useRecoilValue(roomFormState);
  const prevRoom = useRecoilValue(prevRoomAtom);

  const setIsEditMode = useSetRecoilState(isEditModeAtom);
  const updateRoom = useRoomMutate();

  const onSubmit = async (newFields: Partial<Room>) => {
    await updateRoom({ ...prevRoom, ...newFields });
    setIsEditMode(false);
  };

  const handleSubmit = () => {
    onSubmit(roomState);
  };

  return (
    <Button onClick={handleSubmit} type="primary">
      Done
    </Button>
  );
};
