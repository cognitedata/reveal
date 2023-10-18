import { useState } from 'react';

import {
  RequiredFieldValidator,
  Validator,
  getOneToManyModelName,
  getVersionedExternalId,
} from '@platypus/platypus-core';

import { createLink } from '@cognite/cdf-utilities';
import { Modal, OptionType } from '@cognite/cogs.js';

import { useDMContext } from '../../../../../context/DMContext';
import { useCustomTypeNames } from '../../../../../hooks/useDataModelActions';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { generateId } from '../../../../../utils/uuid';
import useTransformationCreateMutation from '../../hooks/useTransformationCreateMutation';
import {
  CreateTransformationForm,
  TransformationType,
} from '../CreateTransformationForm';

type Option = OptionType<any>;

export interface CreateTransformationModalProps {
  onRequestClose: () => void;
}

export const CreateTransformationModal = ({
  onRequestClose,
}: CreateTransformationModalProps) => {
  const { selectedDataModel, selectedDataType: dataType } = useDMContext();

  const { t } = useTranslation('CreateTransformationModal');

  const [selectedRelationship, setSelectedRelationship] = useState<Option>();
  const [selectedDataSet, setSelectedDataSet] = useState<number | undefined>();
  const [transformationType, setTransformationType] = useState(
    TransformationType.Data
  );
  const customTypesNames = useCustomTypeNames();

  const createTransformationMutation = useTransformationCreateMutation();

  const [transformationExternalId] = useState(generateId());
  const transformationName = selectedRelationship
    ? getOneToManyModelName(
        dataType!.name,
        selectedRelationship.value,
        dataType?.version || selectedDataModel.version
      )
    : getVersionedExternalId(
        dataType!.name,
        dataType?.version || selectedDataModel.version
      );

  const relationships: Option[] = dataType!.fields
    .filter((field) => {
      return field.type.list && customTypesNames.includes(field.type.name);
    })
    .map((field) => ({
      value: field.name,
      label: `${dataType!.name}.${field.name}`,
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
        space: selectedDataModel.space,
        oneToManyFieldName: selectedRelationship
          ? selectedRelationship.value
          : undefined,
        transformationExternalId,
        dataSetId: selectedDataSet,
        transformationName,
        typeName: dataType!.name,
        version: dataType?.version || selectedDataModel.version,
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
