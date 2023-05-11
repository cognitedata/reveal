import { ComponentStory } from '@storybook/react';

import { MenuHeader } from './MenuHeader';

export default {
  title: 'Components/FlexibleFilter/Components/MenuHeader',
  component: MenuHeader,
};

export const Example: ComponentStory<typeof MenuHeader> = (args) => (
  <MenuHeader {...args} />
);
Example.args = {
  title: 'Filter name',
};
