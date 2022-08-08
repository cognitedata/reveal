import { Icon } from '@cognite/cogs.js';
import React from 'react';
import { NameInput } from 'components/Map/Popup/NameInput';
import { useRecoilValue } from 'recoil';
import { equipmentTypeAtom } from 'recoil/equipmentPopup/equipmentPopupAtoms';
import { EQUIPMENT_TYPES } from 'recoil/equipmentPopup/constants';

import { EditPopupContent } from '../../Popup/EditPopupContent';
import { EditPopupContentFieldsWrapper } from '../../Popup/elements';
import { EquipmentPopupSubmitButton } from '../EquipmentPopupSubmitButton';
import { IsBrokenCheckbox } from '../Fields/IsBrokenCheckbox';
import { EditOwnerDropdown } from '../Fields/EditOwnerDropdown';

export const EquipmentEditPopupContent: React.FC = () => {
  const equipmentType = useRecoilValue(equipmentTypeAtom);
  return (
    <EditPopupContent SubmitButton={EquipmentPopupSubmitButton}>
      <Icon size={54} type="Cube" />
      <EditPopupContentFieldsWrapper>
        <NameInput />
        <IsBrokenCheckbox />
        {equipmentType === EQUIPMENT_TYPES.DESK ? <EditOwnerDropdown /> : null}
      </EditPopupContentFieldsWrapper>
    </EditPopupContent>
  );
};
