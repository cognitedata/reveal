import { Icon } from '@cognite/cogs.js';
import React from 'react';
import { EditPopupContentFieldsWrapper } from 'components/Map/Popup/elements';

import { EditPopupContent } from '../../Popup/EditPopupContent';
import { NameInput } from '../../Popup/NameInput';

import { RoomPopupSubmitButton } from './RoomPopupSubmitButton';
import { DescriptionInput } from './Fields/DescriptionInput';
import { IsBookableCheckbox } from './Fields/IsBookableCheckbox';

export const RoomEditPopupContent: React.FC = () => {
  return (
    <EditPopupContent SubmitButton={RoomPopupSubmitButton} labels={[]}>
      <Icon size={54} type="Cube" />
      <EditPopupContentFieldsWrapper>
        <NameInput />
        <DescriptionInput />
        <IsBookableCheckbox />
      </EditPopupContentFieldsWrapper>
    </EditPopupContent>
  );
};
