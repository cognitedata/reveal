import { ComponentStory } from '@storybook/react';

import { Menu } from '../Menu';

import { ApplyButton } from './ApplyButton';

export default {
  title: 'FlexibleDataExplorer/Modules/Search/Filter/Components/ApplyButton',
  component: ApplyButton,
};

export const Example: ComponentStory<typeof ApplyButton> = (args) => (
  <Menu>
    <span>This button is made to use inside Menu</span>
    <ApplyButton {...args} />
  </Menu>
);
