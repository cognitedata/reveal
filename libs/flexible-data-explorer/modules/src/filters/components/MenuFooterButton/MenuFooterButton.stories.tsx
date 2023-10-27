import { ComponentStory } from '@storybook/react';

import { Menu } from '../Menu';

import { MenuFooterButton } from './MenuFooterButton';

export default {
  title:
    'FlexibleDataExplorer/Modules/Search/Filter/Components/MenuFooterButton',
  component: MenuFooterButton,
};

export const Example: ComponentStory<typeof MenuFooterButton> = (args) => (
  <Menu>
    <span>This button is made to use inside Menu</span>
    <MenuFooterButton {...args} />
  </Menu>
);
Example.args = {
  text: 'Menu button',
};
