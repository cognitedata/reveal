import React from 'react';
import { Story } from '@storybook/react';
import { FlexPlaceholder } from './FlexPlaceholder';

export default {
  title: 'Basic components/FlexPlaceholder',
  component: FlexPlaceholder,
  decorators: [
    (storyFn: () => React.ReactNode) => (
      <div style={{ height: 700, width: '100%' }}>{storyFn()}</div>
    ),
  ],
};

const Template: Story<Parameters<typeof FlexPlaceholder>[0]> = (args) => (
  <FlexPlaceholder {...args} />
);

export const Default = Template.bind({});
Default.args = {
  title: 'Overview page',
  description:
    'On the overview page we are envisioning main information about a data model.',
};
