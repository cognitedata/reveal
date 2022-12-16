import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';

import { EnvironmentInfoBar } from './EnvironmentInfoBar';

export default {
  component: EnvironmentInfoBar,
  title: 'Components/Environment Infobar',
} as Meta;

const Template: Story<ComponentProps<typeof EnvironmentInfoBar>> = () => (
  <EnvironmentInfoBar />
);

export const Default = Template.bind({});
