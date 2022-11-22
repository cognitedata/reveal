import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { DeleteModal } from 'components/DeleteModal/DeleteModal';

export default {
  component: DeleteModal,
  title: 'Components/Delete Modal',
  argTypes: {
    onOk: { action: 'Clicked on OK' },
    onCancel: { action: 'Clicked on cancel' },
  },
} as Meta;

const Template: Story<ComponentProps<typeof DeleteModal>> = (args) => (
  <DeleteModal {...args} />
);

export const Default = Template.bind({});

Default.args = {
  title: 'Test',
  visible: true,
};
