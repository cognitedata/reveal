import { Body, Icon, Title } from '@cognite/cogs.js';
import { useContext } from 'react';

import { TextWrapper } from '../Popup/elements';
import { PopupContent } from '../Popup/PopupContent';

import { EquipmentContext } from './EquipmentPopupProvider';

interface Props {
  handleEdit: () => void;
}

export const EquipmentPopupContent: React.FC<Props> = ({ handleEdit }) => {
  const { formState } = useContext(EquipmentContext);
  const { name, isBroken, owner } = formState;
  const PopupIcon = <Icon size={54} type="Grid" />;
  return (
    <PopupContent Icon={PopupIcon} handleEdit={handleEdit} labels={[]}>
      <TextWrapper>
        <Title level={3}>{name}</Title>
        <Body>This is owned by {owner.name}</Body>
        <Body>
          {isBroken ? '❌ Sorry! Currently broken.' : '✅  Functional'}
        </Body>
      </TextWrapper>
    </PopupContent>
  );
};
