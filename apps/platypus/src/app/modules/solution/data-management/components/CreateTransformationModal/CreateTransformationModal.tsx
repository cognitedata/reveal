import { useState } from 'react';

import {
  DataModelTypeDefsType,
  RequiredFieldValidator,
  Validator,
  getOneToManyModelName,
  getVersionedExternalId,
} from '@platypus/platypus-core';
import { isFDMv3 } from '@platypus-app/flags';
import { useCustomTypeNames } from '@platypus-app/hooks/useDataModelActions';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { generateId } from '@platypus-app/utils/uuid';

import { createLink } from '@cognite/cdf-utilities';
import { Modal, OptionType } from '@cognite/cogs.js';

import { useDataManagementPageUI } from '../../hooks/useDataManagemenPageUI';
import useTransformationCreateMutation from '../../hooks/useTransformationCreateMutation';
import {
  CreateTransformationForm,
  TransformationType,
} from '../CreateTransformationForm';

type Option = OptionType<any>;

export interface CreateTransformationModalProps {
  dataModelExternalId: string;
  dataModelType: DataModelTypeDefsType;
  onRequestClose: () => void;
  version: string;
  space: string;
}

export const CreateTransformationModal = ({
  dataModelExternalId,
  dataModelType,
  onRequestClose,
  space,
  version,
}: CreateTransformationModalProps) => {
  const isFDMV3 = isFDMv3();
  const { t } = useTranslation('CreateTransformationModal');

  const [selectedRelationship, setSelectedRelationship] = useState<Option>();
  const [transformationType, setTransformationType] = useState(
    TransformationType.Data
  );
  const { setIsTransformationModalOpen } = useDataManagementPageUI();

  const customTypesNames = useCustomTypeNames(
    dataModelExternalId,
    version,
    space
  );

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
        destination: isFDMV3
          ? selectedRelationship
            ? 'edges'
            : 'nodes'
          : 'data_model_instances',
        space,
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
          if (isFDMV3) {
            window.open(
              createLink(`/transformations/${transformation.id}`),
              '_blank'
            );
          } else {
            setIsTransformationModalOpen(true, transformation.id);
          }
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
