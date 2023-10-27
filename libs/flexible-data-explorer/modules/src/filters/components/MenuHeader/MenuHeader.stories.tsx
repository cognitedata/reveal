import { ComponentStory } from '@storybook/react';

import { MenuHeader } from './MenuHeader';

export default {
  title: 'FlexibleDataExplorer/Modules/Search/Filter/Components/MenuHeader',
  component: MenuHeader,
};

export const Example: ComponentStory<typeof MenuHeader> = (args) => (
  <MenuHeader {...args} />
);
Example.args = {
  title: 'Filter name',
};
