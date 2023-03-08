import {
  DataModelSpaceSelect,
  DataModelSpaceSelectProps,
} from './DataModelSpaceSelect';
import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Basic components/DataModelSpaceSelect',
  component: DataModelSpaceSelect,
};

const Template: Story<DataModelSpaceSelectProps> = (args) => (
  <DataModelSpaceSelect {...args} />
);

export const Base = Template.bind({});
Base.args = {
  onSpaceSelect(selectedSpace) {
    action(selectedSpace);
  },
};
