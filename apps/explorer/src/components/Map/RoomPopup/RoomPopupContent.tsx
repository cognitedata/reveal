import { Body, Detail, Icon, Title } from '@cognite/cogs.js';
import { useContext } from 'react';

import { TextWrapper } from '../Popup/elements';
import { PopupContent } from '../Popup/PopupContent';

import { RoomContext } from './RoomPopupProvider';

interface Props {
  handleEdit: () => void;
}

export const RoomPopupContent: React.FC<Props> = ({ handleEdit }) => {
  const { formState } = useContext(RoomContext);
  const { name, description, isBookable } = formState;
  const PopupIcon = <Icon size={54} type="Cube" />;

  return (
    <PopupContent Icon={PopupIcon} handleEdit={handleEdit} labels={[]}>
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
