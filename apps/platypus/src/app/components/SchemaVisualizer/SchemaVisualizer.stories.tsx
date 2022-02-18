import React from 'react';
import { Story } from '@storybook/react';
import { SchemaVisualizer } from './SchemaVisualizer';
import { mockComplexGraphqlModel } from '../../mocks/graphqlModels';

export default {
  title: 'Schema/Schema Visualizer',
  component: SchemaVisualizer,
  decorators: [
    (storyFn: () => React.ReactNode) => (
      <div style={{ height: 500, width: '100%' }}>{storyFn()}</div>
    ),
  ],
};

const Template: Story<Parameters<typeof SchemaVisualizer>[0]> = (args) => (
  <SchemaVisualizer {...args} />
);

export const Default = Template.bind({});

Default.args = {
  graphQLSchemaString: mockComplexGraphqlModel.concat(`
  type Well @template {
    labels: [String!]
    deferments(
      startTime: Long
      endTime: Long
      activeFrom: Long
      activeTo: Long
    ): [Deferment!]!
    advisors: [String!]!
  }`),
};
export const Empty = Template.bind({});

Empty.args = {
  graphQLSchemaString: '',
};
