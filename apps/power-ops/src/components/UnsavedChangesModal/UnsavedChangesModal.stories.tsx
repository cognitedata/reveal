import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { UnsavedChangesModal } from 'components/UnsavedChangesModal/UnsavedChangesModal';

export default {
  component: UnsavedChangesModal,
  title: 'Components/Unsaved Changes Modal',
  argTypes: {
    onOk: { action: 'Clicked on proceed' },
    onCancel: { action: 'Clicked on cancel' },
  },
  args: {
    visible: true,
  },
} as Meta;

const Template: Story<ComponentProps<typeof UnsavedChangesModal>> = (args) => (
  <UnsavedChangesModal {...args} />
);

export const Default = Template.bind({});
