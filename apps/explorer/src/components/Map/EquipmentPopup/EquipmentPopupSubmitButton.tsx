import { useUpdateEquipment } from 'domain/node/internal/actions/equipment/useUpdateEquipment';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';
import { Equipment } from 'graphql/generated';
import { equipmentFormState } from 'recoil/equipmentPopup/equipmentFormState';
import { prevEquipmentAtom } from 'recoil/equipmentPopup/equipmentPopupAtoms';
import { EQUIPMENT_TYPES } from 'recoil/equipmentPopup/constants';

import { FullWidthButton } from '../elements';

export const EquipmentPopupSubmitButton: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const equipmentState = useRecoilValue(equipmentFormState);
  const prevEquipment = useRecoilValue(prevEquipmentAtom);

  const setIsEditMode = useSetRecoilState(isEditModeAtom);

  const updateEquipment = useUpdateEquipment(
    equipmentState.type || EQUIPMENT_TYPES.DESK
  );

  const onSubmit = async (newEquipmentFields: Partial<Equipment>) => {
    await updateEquipment(prevEquipment, newEquipmentFields);
    setIsEditMode(false);
  };

  const handleSubmit = () => {
    onSubmit(equipmentState);
  };

  return (
    <FullWidthButton onClick={handleSubmit} type="primary">
      {children}
    </FullWidthButton>
  );
};
