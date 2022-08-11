import { Body, Detail } from '@cognite/cogs.js';
import { useRecoilValue } from 'recoil';
import { roomFormState } from 'recoil/roomPopup/roomFormState';

import { DivWithMarginBottom, TextWrapper } from '../Popup/elements';
import { PopupContent } from '../Popup/PopupContent';

import { EquipmentList } from './RoomEditPopupContent/EquipmentList';

export const RoomPopupContent: React.FC = () => {
  const { name, description, isBookable, nodeId } =
    useRecoilValue(roomFormState);

  return (
    <PopupContent nodeId={nodeId} name={name || 'No name'}>
      <DivWithMarginBottom>
        <TextWrapper>
          <Body>{description}</Body>
          <Detail>
            {isBookable ? 'This room is bookable' : 'This room is not bookable'}
          </Detail>
        </TextWrapper>
      </DivWithMarginBottom>
      <EquipmentList />
    </PopupContent>
  );
};
