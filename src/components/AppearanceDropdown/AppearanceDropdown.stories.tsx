/**
 * Appearance/Style Dropdown StoryBook
 */

import { Meta, Story } from '@storybook/react';
import React from 'react';
import AppearanceDropdown, { ColorDropdown } from './AppearanceDropdown';

type Props = React.ComponentProps<typeof AppearanceDropdown>;
type ColorDdProps = React.ComponentProps<typeof ColorDropdown>;

export default {
  component: AppearanceDropdown,
  title: 'Components/Appearance Dropdown',
} as Meta;

const Template: Story<Props> = (args) => <AppearanceDropdown {...args} />;
const ColorMenu: Story<ColorDdProps> = (args) => (
  <div style={{ maxWidth: '15rem' }}>
    <ColorDropdown {...args} />
  </div>
);

export const AllOptions = Template.bind({});
export const ColorOptions = ColorMenu.bind({});
export const ColorWithoutTitle = ColorMenu.bind({});

AllOptions.args = {
  onUpdate: () => {},
};

ColorOptions.args = {
  onColorSelected: () => {},
  selectedColor: '#002d9c',
};

ColorWithoutTitle.args = {
  showLabel: false,
  onColorSelected: () => {},
};
