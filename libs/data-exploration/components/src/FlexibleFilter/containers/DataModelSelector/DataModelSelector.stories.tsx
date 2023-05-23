import { ComponentStory } from '@storybook/react';

import { DataModelSelector } from './DataModelSelector';

export default {
  title: 'Components/FlexibleFilter/Containers/DataModelSelector',
  component: DataModelSelector,
};

export const Example: ComponentStory<typeof DataModelSelector> = (args) => (
  <DataModelSelector {...args} />
);
Example.args = {
  dataModels: [
    { name: 'Movie', description: 'Movie description' },
    { name: 'Actor', description: 'Actor description' },
    { name: 'Director', description: 'Director description' },
    { name: 'Data type', description: 'Data type description' },
  ],
};
