/**
 * Appearance/Style Dropdown StoryBook
 */

import { Meta, Story } from '@storybook/react';
import React from 'react';
import AppearanceDropdown from './AppearanceDropdown';

type Props = React.ComponentProps<typeof AppearanceDropdown>;

export default {
  component: AppearanceDropdown,
  title: 'Components/Appearance Dropdown',
} as Meta;

const Template: Story<Props> = (args) => <AppearanceDropdown {...args} />;

export const ApearanceDropdowns = Template.bind({});

ApearanceDropdowns.args = {
  onUpdate: () => {},
};
