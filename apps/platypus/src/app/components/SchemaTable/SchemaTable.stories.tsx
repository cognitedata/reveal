import React from 'react';
import { Story } from '@storybook/react';
import { parse } from 'graphql';
import { SchemaTable } from './SchemaTable';
import { mockComplexGraphqlModel } from '../../mocks/graphqlModels';
import { getObjectTypes } from '../../utils/graphql-utils';

export default {
  title: 'Schema/Schema Table',
  component: SchemaTable,
  decorators: [
    (storyFn: () => React.ReactNode) => (
      <div style={{ height: 500, width: '100%' }}>{storyFn()}</div>
    ),
  ],
};

const Template: Story<Parameters<typeof SchemaTable>[0]> = (args) => (
  <SchemaTable {...args} />
);

export const ErrorState = Template.bind({});
ErrorState.args = {
  schemaName: 'Invalid',
  graphQLSchemaString: mockComplexGraphqlModel,
};

export const Schema = Template.bind({});
Schema.args = {
  schemaName: getObjectTypes(parse(mockComplexGraphqlModel).definitions)[0].name
    .value,
  graphQLSchemaString: mockComplexGraphqlModel,
};
