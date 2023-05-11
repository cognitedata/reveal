import { ComponentStory } from '@storybook/react';

import { Menu } from './Menu';

export default {
  title: 'Components/FlexibleFilter/Components/Menu',
  component: Menu,
};

export const Example: ComponentStory<typeof Menu> = () => (
  <Menu>Menu content goes here...</Menu>
);
