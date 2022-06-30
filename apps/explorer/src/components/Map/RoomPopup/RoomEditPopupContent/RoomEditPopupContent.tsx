import { Icon } from '@cognite/cogs.js';
import React, { useContext } from 'react';
import { Room } from 'graphql/generated';

import { EditPopupContent } from '../../Popup/EditPopupContent';
import { EditPopupContentFieldsWrapper } from '../../Popup/elements';
import { RoomContext } from '../RoomPopupProvider';

import { NameInput } from './NameInput';
import { DescriptionInput } from './DescriptionInput';
import { IsBookableCheckbox } from './IsBookableCheckbox';

interface Props {
  onSubmit: (newFields: Partial<Room>) => void;
}

export const RoomEditPopupContent: React.FC<Props> = ({ onSubmit }) => {
  const { formState } = useContext(RoomContext);
  const { name, description, isBookable } = formState;
  const handleSubmit = () => onSubmit({ name, description, isBookable });

  return (
    <EditPopupContent handleSubmit={handleSubmit} labels={[]}>
      <Icon size={54} type="Cube" />
      <EditPopupContentFieldsWrapper>
        <NameInput />
        <DescriptionInput />
        <IsBookableCheckbox />
      </EditPopupContentFieldsWrapper>
    </EditPopupContent>
  );
};
