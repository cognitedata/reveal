import { EquipmentMutate, PersonMutate } from 'domain/node/internal/types';

import { Icon } from '@cognite/cogs.js';
import React, { useContext } from 'react';

import { EditPopupContent } from '../../Popup/EditPopupContent';
import { EditPopupContentFieldsWrapper } from '../../Popup/elements';
import { EquipmentContext } from '../EquipmentPopupProvider';

import { NameInput } from './NameInput';
import { IsBrokenCheckbox } from './IsBrokenCheckbox';
import { EditOwnerDropdown } from './EditOwnerDropdown';

interface Props {
  onSubmit: (
    newEquipmentFields: Partial<EquipmentMutate>,
    oldPersonFields: Pick<PersonMutate, 'name' | 'externalId'>,
    newPersonFields: Pick<PersonMutate, 'name' | 'externalId' | 'desk'>
  ) => void;
}

export const EquipmentEditPopupContent: React.FC<Props> = ({ onSubmit }) => {
  const { formState, updateFields } = useContext(EquipmentContext);
  const { externalId, name, isBroken, owner, selected } = formState;
  const handleSubmit = () => {
    onSubmit(
      {
        name,
        isBroken,
        person: owner.externalId || '',
      },
      { name: owner.name, externalId: owner.externalId || '' },
      {
        name: selected.name,
        externalId: selected.externalId || '',
        desk: externalId,
      }
    );
    updateFields({ owner: selected });
  };

  return (
    <EditPopupContent handleSubmit={handleSubmit} labels={[]}>
      <Icon size={54} type="Cube" />
      <EditPopupContentFieldsWrapper>
        <NameInput />
        <IsBrokenCheckbox />
        <EditOwnerDropdown />
      </EditPopupContentFieldsWrapper>
    </EditPopupContent>
  );
};
