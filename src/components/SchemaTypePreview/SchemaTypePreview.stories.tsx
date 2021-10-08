import React from 'react';
import { Story } from '@storybook/react';
import { SchemaTypePreview } from './SchemaTypePreview';
import { mockComplexGraphqlModel } from '../../mocks/graphqlModels';
import { getObjectTypes } from '../../utils/graphql-utils';
import { parse } from 'graphql';

export default {
  title: 'Components/Schema Type Preview',
  component: SchemaTypePreview,
  decorators: [
    (storyFn: () => React.ReactNode) => (
      <div style={{ height: 500, width: '100%' }}>{storyFn()}</div>
    ),
  ],
};

const Template: Story<Parameters<typeof SchemaTypePreview>[0]> = (args) => (
  <SchemaTypePreview {...args} />
);


export const Default = Template.bind({});
Default.args = {
  schemaName: getObjectTypes(parse(mockComplexGraphqlModel).definitions)[0].name
    .value,
  graphQLSchemaString: mockComplexGraphqlModel,
};
