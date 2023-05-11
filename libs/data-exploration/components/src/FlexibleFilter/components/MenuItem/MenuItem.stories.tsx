import { ComponentStory } from '@storybook/react';

import { MenuItem } from './MenuItem';

export default {
  title: 'Components/FlexibleFilter/Components/MenuItem',
  component: MenuItem,
};

export const Example: ComponentStory<typeof MenuItem> = (args) => (
  <MenuItem {...args} />
);
Example.args = {
  title: 'Movie',
  subtitle: 'Rotten Tomato',
};
