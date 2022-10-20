import {
  DataModelDetailModal,
  DataModelDetailModalProps,
} from './DataModelDetailModal';
import noop from 'lodash/noop';
import { Story } from '@storybook/react';

export default {
  title: 'Basic components/DataModelDetailModal',
  component: DataModelDetailModal,
};

const Template: Story<DataModelDetailModalProps> = (args) => (
  <DataModelDetailModal {...args} />
);

export const Base = Template.bind({});
Base.args = {
  dataSets: [],
  description: 'Lorem ipsum dolor amit.',
  externalId: 'lorem-ipsum',
  name: 'Lorem Ipsum',
  onCancel: noop,
  onDescriptionChange: noop,
  onNameChange: noop,
  onSubmit: noop,
  title: 'Settings',
};

export const LockedExternalId = Template.bind({});
LockedExternalId.args = { ...Base.args, isExternalIdLocked: true };
