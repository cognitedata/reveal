import { Story } from '@storybook/react';
import noop from 'lodash/noop';

import {
  CreateNewSpaceModal,
  CreateNewSpaceModalProps,
} from './CreateNewSpaceModal';

export default {
  title: 'Basic components/CreateNewSpaceModal',
  component: CreateNewSpaceModal,
};

const Template: Story<CreateNewSpaceModalProps> = (args) => (
  <CreateNewSpaceModal {...args} />
);

export const Base = Template.bind({});
Base.args = {
  visible: true,
  onCancel: noop,
  onSpaceCreated: noop,
};
