import { ComponentStory } from '@storybook/react';

import { DataTypeSelector } from './DataTypeSelector';

export default {
  title: 'FlexibleDataExplorer/Modules/Search/Filter/Modules/DataTypeSelector',
  component: DataTypeSelector,
};

export const Example: ComponentStory<typeof DataTypeSelector> = (args) => (
  <DataTypeSelector {...args} />
);
Example.args = {
  dataTypes: [
    { name: 'Movie', description: 'Movie description' },
    { name: 'Actor', description: 'Actor description' },
    { name: 'Director', description: 'Director description' },
    { name: 'Data type', description: 'Data type description' },
  ],
};
