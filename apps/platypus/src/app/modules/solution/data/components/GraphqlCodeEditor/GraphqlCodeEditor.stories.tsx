import React from 'react';
import { Story } from '@storybook/react';
import { GraphqlCodeEditor } from './GraphqlCodeEditor';
import { mockComplexGraphqlModel } from '@platypus-app/mocks/graphqlModels';

export default {
  title: 'Schema/Graphql Code Editor',
  component: GraphqlCodeEditor,
  decorators: [
    (storyFn: () => React.ReactNode) => (
      <div style={{ height: 500, width: '100%' }}>{storyFn()}</div>
    ),
  ],
};

const Template: Story<Parameters<typeof GraphqlCodeEditor>[0]> = (args) => (
  <GraphqlCodeEditor {...args} />
);

export const Default = Template.bind({});

Default.args = {
  code: mockComplexGraphqlModel,
};
