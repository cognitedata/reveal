import { ComponentStory } from '@storybook/react';

import { Menu } from './Menu';

export default {
  title: 'FlexibleDataExplorer/Modules/Search/Filter/Components/Menu',
  component: Menu,
};

export const Example: ComponentStory<typeof Menu> = () => (
  <Menu>Menu content goes here...</Menu>
);
