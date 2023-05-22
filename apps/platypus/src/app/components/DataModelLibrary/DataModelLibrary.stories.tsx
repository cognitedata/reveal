import React from 'react';
import { Story } from '@storybook/react';
import { DataModelLibrary } from './DataModelLibrary';

export default {
  title: 'Data Model/Data Model Library',
  component: DataModelLibrary,
  decorators: [
    (storyFn: () => React.ReactNode) => (
      <div style={{ height: 500, width: '100%' }}>{storyFn()}</div>
    ),
  ],
};

const Template: Story<Parameters<typeof DataModelLibrary>[0]> = (args) => (
  <DataModelLibrary {...args} />
);

export const Default = Template.bind({});

Default.args = {
  dataModels: [],
};
