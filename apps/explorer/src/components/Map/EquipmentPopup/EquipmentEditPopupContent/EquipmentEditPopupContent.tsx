import { Icon } from '@cognite/cogs.js';
import React from 'react';
import { NameInput } from 'components/Map/Popup/NameInput';

import { EditPopupContent } from '../../Popup/EditPopupContent';
import { EditPopupContentFieldsWrapper } from '../../Popup/elements';
import { EquipmentPopupSubmitButton } from '../EquipmentPopupSubmitButton';
import { IsBrokenCheckbox } from '../Fields/IsBrokenCheckbox';
import { EditOwnerDropdown } from '../Fields/EditOwnerDropdown';

export const EquipmentEditPopupContent: React.FC = () => {
  return (
    <EditPopupContent SubmitButton={EquipmentPopupSubmitButton} labels={[]}>
      <Icon size={54} type="Cube" />
      <EditPopupContentFieldsWrapper>
        <NameInput />
        <IsBrokenCheckbox />
        <EditOwnerDropdown />
      </EditPopupContentFieldsWrapper>
    </EditPopupContent>
  );
};
