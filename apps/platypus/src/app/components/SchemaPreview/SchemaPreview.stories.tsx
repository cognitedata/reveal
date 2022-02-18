import React from 'react';
import { Story } from '@storybook/react';
import { SchemaPreview } from './SchemaPreview';
import { mockComplexGraphqlModel } from '../../mocks/graphqlModels';

export default {
  title: 'Schema/Schema Preview',
  component: SchemaPreview,
  decorators: [
    (storyFn: () => React.ReactNode) => (
      <div style={{ height: 500, width: '100%' }}>{storyFn()}</div>
    ),
  ],
};

const Template: Story<Parameters<typeof SchemaPreview>[0]> = (args) => (
  <SchemaPreview {...args} />
);

export const Default = Template.bind({});
Default.args = {
  graphQLSchemaString: mockComplexGraphqlModel,
};
