import { Equipment } from 'graphql/generated';
import { useRecoilState } from 'recoil';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';
import { equipmentFormState } from 'recoil/equipmentPopup/equipmentFormState';
import { useSetupPopup } from 'hooks/useSetupPopup';

import { EquipmentPopupContent } from './EquipmentPopupContent';
import { EquipmentEditPopupContent } from './EquipmentEditPopupContent';

export interface Props {
  data: Equipment;
}

export const EquipmentPopup: React.FC<Props> = ({ data }) => {
  const [isEditMode, setIsEditMode] = useRecoilState(isEditModeAtom);
  useSetupPopup(data, equipmentFormState);

  return isEditMode ? (
    <EquipmentEditPopupContent />
  ) : (
    <EquipmentPopupContent handleEdit={() => setIsEditMode(true)} />
  );
};
