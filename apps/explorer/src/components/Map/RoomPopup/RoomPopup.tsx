import { Room } from 'graphql/generated';
import { useRecoilState } from 'recoil';
import { roomFormState } from 'recoil/roomPopup/roomFormState';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';
import { useSetupPopup } from 'hooks/useSetupPopup';

import { RoomPopupContent } from './RoomPopupContent';
import { RoomEditPopupContent } from './RoomEditPopupContent';

export interface Props {
  data: Room;
}

export const RoomPopup: React.FC<Props> = ({ data }) => {
  const [isEditMode, setIsEditMode] = useRecoilState(isEditModeAtom);
  useSetupPopup(data, roomFormState);
  const handleEdit = () => setIsEditMode(true);

  return isEditMode ? (
    <RoomEditPopupContent />
  ) : (
    <RoomPopupContent handleEdit={handleEdit} />
  );
};
