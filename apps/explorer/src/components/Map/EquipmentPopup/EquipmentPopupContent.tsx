import { useUnassignEquipment } from 'domain/node/internal/actions/equipment/useUnassignEquipment';

import { Body, Button, Icon, Title } from '@cognite/cogs.js';
import { useRecoilState, useRecoilValue } from 'recoil';
import { equipmentFormState } from 'recoil/equipmentPopup/equipmentFormState';
import { prevEquipmentAtom } from 'recoil/equipmentPopup/equipmentPopupAtoms';

import { TextWrapper } from '../Popup/elements';
import { PopupContent } from '../Popup/PopupContent';

interface Props {
  handleEdit: () => void;
}

const renderIcon = () => <Icon size={54} type="Grid" />;

export const EquipmentPopupContent: React.FC<Props> = ({ handleEdit }) => {
  const [{ name, isBroken, person, nodeId }, setEquipmentForm] =
    useRecoilState(equipmentFormState);
  const prevState = useRecoilValue(prevEquipmentAtom);
  const unassignEquipment = useUnassignEquipment();

  const subtitle = person?.name
    ? `This is currently owned by ${person.name}`
    : 'No owner';

  const handleClick = async () => {
    await unassignEquipment(prevState);
    setEquipmentForm((lastState) => {
      return { ...lastState, person: null };
    });
  };

  return (
    <PopupContent
      Icon={renderIcon}
      nodeId={nodeId}
      handleEdit={handleEdit}
      labels={[]}
    >
      <TextWrapper>
        <Title level={3}>{name}</Title>
        <Body>{subtitle}</Body>
        <Body>
          {isBroken ? '❌ Sorry! Currently broken.' : '✅  Functional'}
        </Body>
        <Button type="primary" onClick={handleClick}>
          Unassign
        </Button>
      </TextWrapper>
    </PopupContent>
  );
};
