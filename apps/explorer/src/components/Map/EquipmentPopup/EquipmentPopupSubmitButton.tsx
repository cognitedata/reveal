import { useUpdateEquipment } from 'domain/node/internal/actions/equipment/useUpdateEquipment';

import { Button } from '@cognite/cogs.js';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';
import { Equipment } from 'graphql/generated';
import { equipmentFormState } from 'recoil/equipmentPopup/equipmentFormState';
import { prevEquipmentAtom } from 'recoil/equipmentPopup/equipmentPopupAtoms';

export const EquipmentPopupSubmitButton = () => {
  const equipmentState = useRecoilValue(equipmentFormState);
  const prevEquipment = useRecoilValue(prevEquipmentAtom);

  const setIsEditMode = useSetRecoilState(isEditModeAtom);

  const updateEquipment = useUpdateEquipment();

  const onSubmit = async (newEquipmentFields: Partial<Equipment>) => {
    await updateEquipment(prevEquipment, newEquipmentFields);
    setIsEditMode(false);
  };

  const handleSubmit = () => {
    onSubmit(equipmentState);
  };

  return (
    <Button onClick={handleSubmit} type="primary">
      Done
    </Button>
  );
};
