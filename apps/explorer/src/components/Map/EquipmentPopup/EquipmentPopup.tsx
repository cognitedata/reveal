import { EquipmentMutate, PersonMutate } from 'domain/node/internal/types';
import { useUpdateEquipment } from 'domain/node/internal/actions/equipment/useUpdateEquipment';

import { Equipment } from 'graphql/generated';
import { useState } from 'react';

import { Container, Content } from '../Popup/elements';

import { EquipmentPopupContent } from './EquipmentPopupContent';
import { EquipmentEditPopupContent } from './EquipmentEditPopupContent';
import { EquipmentPopupProvider } from './EquipmentPopupProvider';

export interface Props {
  data: Equipment;
}

export const EquipmentPopup: React.FC<Props> = ({ data }) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const updateEquipment = useUpdateEquipment();

  const onSubmit = async (
    newEquipmentFields: Partial<EquipmentMutate>,
    oldPersonFields: Pick<PersonMutate, 'name' | 'externalId'>,
    newPersonFields: Pick<PersonMutate, 'name' | 'externalId' | 'desk'>
  ) => {
    await updateEquipment(
      data,
      newEquipmentFields,
      oldPersonFields,
      newPersonFields
    );
    setIsEditMode(false);
  };

  return (
    <EquipmentPopupProvider data={data}>
      <Container>
        <Content className="z-2">
          {isEditMode ? (
            <EquipmentEditPopupContent onSubmit={onSubmit} />
          ) : (
            <EquipmentPopupContent handleEdit={() => setIsEditMode(true)} />
          )}
        </Content>
      </Container>
    </EquipmentPopupProvider>
  );
};
