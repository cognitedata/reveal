import React from 'react';
import { Story } from '@storybook/react';
import { SchemaList } from './SchemaList';
import { mockComplexGraphqlModel } from '../../mocks/graphqlModels';

export default {
  title: 'Schema/Schema List',
  component: SchemaList,
  decorators: [
    (storyFn: () => React.ReactNode) => (
      <div style={{ height: 500, width: '100%' }}>{storyFn()}</div>
    ),
  ],
};

const Template: Story<Parameters<typeof SchemaList>[0]> = (args) => (
  <SchemaList {...args} />
);

export const Default = Template.bind({});

Default.args = {
  graphQLSchemaString: mockComplexGraphqlModel,
};
