/**
 * Appearance/Style Dropdown StoryBook
 */

import { Meta, Story } from '@storybook/react';
import {
  AppearanceDropdown,
  AppearanceDropdownProps,
} from './AppearanceDropdown';

export default {
  component: AppearanceDropdown,
  title: 'Components/Appearance Dropdown',
} as Meta;

const Template: Story<AppearanceDropdownProps> = (args) => (
  <AppearanceDropdown {...args} />
);

export const ApearanceDropdowns = Template.bind({});

ApearanceDropdowns.args = {
  onUpdate: () => {},
};
