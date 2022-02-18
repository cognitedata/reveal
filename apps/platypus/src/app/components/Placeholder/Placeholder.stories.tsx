import React from 'react';
import { Story } from '@storybook/react';
import { Placeholder } from './Placeholder';

export default {
  title: 'Basic components/Placeholder',
  component: Placeholder,
  decorators: [
    (storyFn: () => React.ReactNode) => (
      <div style={{ height: 700, width: '100%' }}>{storyFn()}</div>
    ),
  ],
};

const Template: Story<Parameters<typeof Placeholder>[0]> = (args) => (
  <Placeholder {...args} />
);

export const Default = Template.bind({});
Default.args = {
  componentName: 'Overview page',
  componentDescription:
    'On the overview page we are envisioning main information about a solution.',
};

const TemplateWithoutGraphic: Story<Parameters<typeof Placeholder>[0]> = (
  args
) => <Placeholder {...args} />;

export const WithoutGraphic = TemplateWithoutGraphic.bind({});

WithoutGraphic.args = {
  componentName: 'UI editor',
  componentDescription: 'It will help you build data model even faster.',
  showGraphic: false,
};
