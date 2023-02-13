import { useState } from 'react';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Modal, OptionType } from '@cognite/cogs.js';

import {
  DataModelTypeDefsType,
  RequiredFieldValidator,
  Validator,
} from '@platypus/platypus-core';
import {
  CreateTransformationForm,
  TransformationType,
} from '../CreateTransformationForm';
import useTransformationCreateMutation from '../../hooks/useTransformationCreateMutation';
import { useDataManagementPageUI } from '../../hooks/useDataManagemenPageUI';
import useSelector from '@platypus-app/hooks/useSelector';
import { generateId } from '@platypus-app/utils/uuid';
import {
  getOneToManyModelName,
  getVersionedExternalId,
} from '@platypus/platypus-core';

type Option = OptionType<any>;

export interface CreateTransformationModalProps {
  dataModelExternalId: string;
  dataModelType: DataModelTypeDefsType;
  onRequestClose: () => void;
  version: string;
}

export const CreateTransformationModal = ({
  dataModelExternalId,
  dataModelType,
  onRequestClose,
  version,
}: CreateTransformationModalProps) => {
  const { t } = useTranslation('CreateTransformationModal');

  const [selectedRelationship, setSelectedRelationship] = useState<Option>();
  const [transformationType, setTransformationType] = useState(
    TransformationType.Data
  );
  const { setIsTransformationModalOpen } = useDataManagementPageUI();
  const { customTypesNames } = useSelector((state) => state.dataModel);

  const createTransformationMutation = useTransformationCreateMutation();

  const [transformationExternalId] = useState(generateId());
  const transformationName = selectedRelationship
    ? getOneToManyModelName(
        dataModelType.name,
        selectedRelationship.value,
        version
      )
    : getVersionedExternalId(dataModelType.name, version);

  const relationships: Option[] = dataModelType.fields
    .filter((field) => {
      return field.type.list && customTypesNames.includes(field.type.name);
    })
    .map((field) => ({
      value: field.name,
      label: `${dataModelType.name}.${field.name}`,
    }));

  const validator = new Validator({
    selectedRelationship,
  });
  if (transformationType === TransformationType.RelationShip) {
    validator.addRule('selectedRelationship', new RequiredFieldValidator());
  }
  const validationResult = validator.validate();

  const handleTransformationTypeChange = (value: TransformationType) => {
    setTransformationType(value);

    if (value === TransformationType.Data) {
      setSelectedRelationship(undefined);
    }
  };

  const handleSubmit = () => {
    createTransformationMutation.mutate(
      {
        dataModelExternalId,
        oneToManyFieldName: selectedRelationship
          ? selectedRelationship.value
          : undefined,
        transformationExternalId,
        transformationName,
        typeName: dataModelType.name,
        version,
      },
      {
        onSuccess: (transformation) => {
          onRequestClose();
          setIsTransformationModalOpen(true, transformation.id);
        },
      }
    );
  };

  return (
    <Modal
      visible
      title={t('create_transformation_modal_title', 'Create transformation')}
      onOk={handleSubmit}
      onCancel={onRequestClose}
      okDisabled={
        !validationResult.valid || createTransformationMutation.isLoading
      }
      icon={createTransformationMutation.isLoading ? 'Loader' : undefined}
      okText={t('create_transformation_modal_ok_button', 'Next')}
      size="large"
    >
      <CreateTransformationForm
        id={transformationExternalId}
        name={transformationName}
        onRelationshipChange={setSelectedRelationship}
        onTransformationTypeChange={handleTransformationTypeChange}
        relationships={relationships}
        selectedRelationship={selectedRelationship}
        transformationType={transformationType}
      />
    </Modal>
  );
};
