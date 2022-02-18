import React from 'react';
import { Story } from '@storybook/react';
import { PageToolbar } from './PageToolbar';
import { Button } from '@cognite/cogs.js';
// import { mockComplexGraphqlModel } from '../../mocks/graphqlModels';

export default {
  title: 'Basic components/PageToolbar',
  component: PageToolbar,
  decorators: [(storyFn: () => React.ReactNode) => <div>{storyFn()}</div>],
};

const Template: Story<Parameters<typeof PageToolbar>[0]> = (args) => (
  <PageToolbar {...args} />
);

export const Default = Template.bind({});

Default.args = {
  title: 'Overview',
};

const TemplateWithBackButton: Story<Parameters<typeof PageToolbar>[0]> = (
  args
) => <PageToolbar {...args} />;

export const WithBackButton = TemplateWithBackButton.bind({});

WithBackButton.args = {
  title: 'Data model',
  backPathname: '/',
};

const TemplateWithTools: Story<Parameters<typeof PageToolbar>[0]> = (args) => (
  <PageToolbar {...args}>
    <Button
      onClick={() => {
        alert('Demo');
      }}
    >
      Demo
    </Button>
  </PageToolbar>
);

export const WithTools = TemplateWithTools.bind({});

WithTools.args = {
  title: 'Data model',
};
