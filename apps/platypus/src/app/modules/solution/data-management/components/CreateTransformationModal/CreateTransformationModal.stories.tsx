import { useState } from 'react';
import { CreateTransformationModal } from './CreateTransformationModal';
import { OptionType } from '@cognite/cogs.js';

type Option = OptionType<any>;

export default {
  title: 'Basic components/CreateTransformationModal',
  component: CreateTransformationModal,
};

export const Base = () => {
  return (
    <CreateTransformationModal
      name={'Example Transformation'}
      id={'exampleTransformation'}
      onRequestClose={() => {
        return;
      }}
      onOk={() => {
        return;
      }}
    />
  );
};

export const WithRelationships = () => {
  const relationships = [
    { label: 'Model.Relation1', value: 'Model.Relation1' },
    { label: 'Model.Relation2', value: 'Model.Relation2' },
  ];
  const [selectedRelationship, setSelectedRelationship] = useState<Option>(
    relationships[0]
  );

  return (
    <CreateTransformationModal
      name={'Example Transformation'}
      id={'exampleTransformation'}
      relationships={relationships}
      selectedRelationship={selectedRelationship}
      onRelationshipChange={(newRelationship) => {
        setSelectedRelationship(newRelationship);
      }}
      onRequestClose={() => {
        return;
      }}
      onOk={() => {
        return;
      }}
    />
  );
};

WithRelationships.storyName = 'With relationships';
