import { Room } from 'graphql/generated';
import { useRecoilValue } from 'recoil';
import { roomFormState } from 'recoil/roomPopup/roomFormState';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';
import { useSetupPopup } from 'hooks/useSetupPopup';

import { RoomPopupContent } from './RoomPopupContent';
import { RoomEditPopupContent } from './RoomEditPopupContent';

export interface Props {
  data: Room;
}

export const RoomPopup: React.FC<Props> = ({ data }) => {
  const isEditMode = useRecoilValue(isEditModeAtom);
  useSetupPopup(data, roomFormState);

  return isEditMode ? <RoomEditPopupContent /> : <RoomPopupContent />;
};
