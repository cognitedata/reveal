import { useState } from 'react';

import {
  DataModelTypeDefsType,
  RequiredFieldValidator,
  Validator,
  getOneToManyModelName,
  getVersionedExternalId,
} from '@platypus/platypus-core';
import { useCustomTypeNames } from '@platypus-app/hooks/useDataModelActions';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { generateId } from '@platypus-app/utils/uuid';

import { createLink } from '@cognite/cdf-utilities';
import { Modal, OptionType } from '@cognite/cogs.js';

import useTransformationCreateMutation from '../../hooks/useTransformationCreateMutation';
import {
  CreateTransformationForm,
  TransformationType,
} from '../CreateTransformationForm';

type Option = OptionType<any>;

export interface CreateTransformationModalProps {
  dataModelExternalId: string;
  dataModelType: DataModelTypeDefsType;
  dataModelVersion: string;
  onRequestClose: () => void;
  space: string;
  viewVersion: string;
}

export const CreateTransformationModal = ({
  dataModelExternalId,
  dataModelType,
  dataModelVersion,
  onRequestClose,
  space,
  viewVersion,
}: CreateTransformationModalProps) => {
  const { t } = useTranslation('CreateTransformationModal');

  const [selectedRelationship, setSelectedRelationship] = useState<Option>();
  const [selectedDataSet, setSelectedDataSet] = useState<number | undefined>();
  const [transformationType, setTransformationType] = useState(
    TransformationType.Data
  );
  const customTypesNames = useCustomTypeNames(
    dataModelExternalId,
    dataModelVersion,
    space
  );

  const createTransformationMutation = useTransformationCreateMutation();

  const [transformationExternalId] = useState(generateId());
  const transformationName = selectedRelationship
    ? getOneToManyModelName(
        dataModelType.name,
        selectedRelationship.value,
        viewVersion
      )
    : getVersionedExternalId(dataModelType.name, viewVersion);

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
        destination: selectedRelationship ? 'edges' : 'nodes',
        space,
        oneToManyFieldName: selectedRelationship
          ? selectedRelationship.value
          : undefined,
        transformationExternalId,
        dataSetId: selectedDataSet,
        transformationName,
        typeName: dataModelType.name,
        version: viewVersion,
      },
      {
        onSuccess: (transformation) => {
          onRequestClose();
          window.open(
            createLink(`/transformations/${transformation.id}`),
            '_blank'
          );
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
        selectedDataSet={selectedDataSet}
        onDataSetChange={setSelectedDataSet}
      />
    </Modal>
  );
};
