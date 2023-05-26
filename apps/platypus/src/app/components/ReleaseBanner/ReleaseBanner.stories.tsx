import React from 'react';

import { Story } from '@storybook/react';
import noop from 'lodash/noop';

import { ReleaseBanner } from './ReleaseBanner';

export default {
  title: 'Basic components/Release Banner',
  component: ReleaseBanner,
  decorators: [
    (storyFn: () => React.ReactNode) => (
      <div style={{ height: 700, width: '100%' }}>{storyFn()}</div>
    ),
  ],
};

const Template: Story<Parameters<typeof ReleaseBanner>[0]> = (args) => (
  <ReleaseBanner {...args} />
);

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  buttonText: 'View previous data models',
  text: 'Select "View previous data models" to work with data models you created with the previous beta: ',
  onClick: noop,
};
