import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import {
  DataModelSpaceSelect,
  DataModelSpaceSelectProps,
} from './DataModelSpaceSelect';

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
