import { Body, Detail, Icon, Title } from '@cognite/cogs.js';
import { useRecoilValue } from 'recoil';
import { roomFormState } from 'recoil/roomPopup/roomFormState';

import { TextWrapper } from '../Popup/elements';
import { PopupContent } from '../Popup/PopupContent';

interface Props {
  handleEdit: () => void;
}

export const RoomPopupContent: React.FC<Props> = ({ handleEdit }) => {
  const { name, description, isBookable, nodeId } =
    useRecoilValue(roomFormState);
  const PopupIcon = <Icon size={54} type="Cube" />;

  return (
    <PopupContent
      nodeId={nodeId}
      Icon={PopupIcon}
      handleEdit={handleEdit}
      labels={[]}
    >
      <TextWrapper>
        <Title level={3}>{name}</Title>
        <Detail>{description}</Detail>
      </TextWrapper>
      <Body>
        {isBookable ? 'This room is bookable' : 'This room is not bookable'}
      </Body>
    </PopupContent>
  );
};
