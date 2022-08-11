import { useUnassignDesk } from 'domain/node/internal/actions/equipment/useUnassignDesk';

import { Body, Button } from '@cognite/cogs.js';
import { useRecoilState, useRecoilValue } from 'recoil';
import { equipmentFormState } from 'recoil/equipmentPopup/equipmentFormState';
import { prevEquipmentAtom } from 'recoil/equipmentPopup/equipmentPopupAtoms';

import { TextWrapper } from '../Popup/elements';
import { PopupContent } from '../Popup/PopupContent';

export const EquipmentPopupContent: React.FC = () => {
  const [{ name, isBroken, person, nodeId }, setEquipmentForm] =
    useRecoilState(equipmentFormState);
  const prevState = useRecoilValue(prevEquipmentAtom);
  const unassignEquipment = useUnassignDesk();

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
    <PopupContent name={name || 'No name'} nodeId={nodeId}>
      <TextWrapper>
        <Body>{subtitle}</Body>
        <Body>
          {isBroken ? '❌ Sorry! Currently broken' : '✅  Functional'}
        </Body>
        {person?.externalId && (
          <Button type="primary" onClick={handleClick}>
            Unassign
          </Button>
        )}
      </TextWrapper>
    </PopupContent>
  );
};
