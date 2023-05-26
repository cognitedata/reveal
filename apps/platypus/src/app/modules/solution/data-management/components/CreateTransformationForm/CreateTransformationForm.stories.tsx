import { useState } from 'react';

import noop from 'lodash/noop';

import { OptionType } from '@cognite/cogs.js';

import {
  CreateTransformationForm,
  TransformationType,
} from './CreateTransformationForm';

type Option = OptionType<any>;

export default {
  title: 'Basic components/CreateTransformationForm',
  component: CreateTransformationForm,
};

export const Base = () => {
  return (
    <div style={{ width: '600px', border: '1px solid gray', padding: '36px' }}>
      <CreateTransformationForm
        id="exampleTransformation"
        name="Example Transformation"
        onRelationshipChange={noop}
        onTransformationTypeChange={noop}
        transformationType={TransformationType.Data}
      />
    </div>
  );
};

export const WithRelationships = () => {
  const relationships = [
    { label: 'Model.Relation1', value: 'Model.Relation1' },
    { label: 'Model.Relation2', value: 'Model.Relation2' },
  ];
  const [selectedRelationship, setSelectedRelationship] = useState<Option>();
  const [transformationType, setTransformationType] = useState(
    TransformationType.Data
  );

  return (
    <div style={{ width: '600px', border: '1px solid gray', padding: '36px' }}>
      <CreateTransformationForm
        id="exampleTransformation"
        name="Example Transformation"
        onRelationshipChange={setSelectedRelationship}
        onTransformationTypeChange={setTransformationType}
        relationships={relationships}
        selectedRelationship={selectedRelationship}
        transformationType={transformationType}
      />
    </div>
  );
};

WithRelationships.storyName = 'With relationships';
