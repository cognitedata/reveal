import { ComponentStory } from '@storybook/react';

import { FieldSelector } from './FieldSelector';

export default {
  title: 'FlexibleDataExplorer/Modules/Search/Filter/Modules/FieldSelector',
  component: FieldSelector,
};

export const Example: ComponentStory<typeof FieldSelector> = (args) => (
  <FieldSelector {...args} />
);
Example.args = {
  title: 'Movies',
  fields: [
    { id: 'Title', type: 'string' },
    { id: 'Gross', type: 'number' },
    { id: 'Boolean', type: 'boolean' },
    { id: 'Date', type: 'date' },
  ],
};
