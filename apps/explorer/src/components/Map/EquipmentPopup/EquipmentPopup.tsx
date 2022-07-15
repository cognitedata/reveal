import { Equipment } from 'graphql/generated';
import { useRecoilValue } from 'recoil';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';
import { equipmentFormState } from 'recoil/equipmentPopup/equipmentFormState';
import { useSetupPopup } from 'hooks/useSetupPopup';

import { EquipmentPopupContent } from './EquipmentPopupContent';
import { EquipmentEditPopupContent } from './EquipmentEditPopupContent';

export interface Props {
  data: Equipment;
}

export const EquipmentPopup: React.FC<Props> = ({ data }) => {
  const isEditMode = useRecoilValue(isEditModeAtom);
  useSetupPopup(data, equipmentFormState);

  return isEditMode ? <EquipmentEditPopupContent /> : <EquipmentPopupContent />;
};
