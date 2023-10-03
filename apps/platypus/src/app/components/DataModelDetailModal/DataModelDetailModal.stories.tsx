import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';
import noop from 'lodash/noop';

import {
  DataModelDetailModal,
  DataModelDetailModalProps,
} from './DataModelDetailModal';

export default {
  title: 'Basic components/DataModelDetailModal',
  component: DataModelDetailModal,
};

const Template: Story<DataModelDetailModalProps> = (args) => (
  <DataModelDetailModal {...args} />
);

export const Base = Template.bind({});
Base.args = {
  description: 'Lorem ipsum dolor amit.',
  externalId: 'lorem-ipsum',
  name: 'Lorem Ipsum',
  onCancel: noop,
  onDescriptionChange: noop,
  onNameChange: noop,
  onSubmit: noop,
  title: 'Settings',
  visible: true,
};

export const LockedExternalId = Template.bind({});
LockedExternalId.args = {
  ...Base.args,
  isExternalIdLocked: true,
  visible: true,
};

export const SpacesDisabled = Template.bind({});
SpacesDisabled.args = { ...Base.args, isSpaceDisabled: true, visible: true };

export const LibraryEnabled = Template.bind({});
LibraryEnabled.args = {
  ...Base.args,
  visible: true,
  onDMLChange: action('template DML selected'),
};
