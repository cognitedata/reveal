import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { userEvent, within } from '@storybook/testing-library';
import { ContextDropdown } from 'components/ContextDropdown/ContextDropdown';

export default {
  component: ContextDropdown,
  title: 'Components/Context Dropdown',
  parameters: {
    layout: 'centered',
  },
  args: { recordId: '1' },
} as Meta;

const Template: Story<ComponentProps<typeof ContextDropdown>> = (args) => (
  <ContextDropdown {...args} />
);

export const Default = Template.bind({});
Default.args = {
  dropdownMenuProps: { style: { minWidth: 150 } },
  items: [
    { children: 'Duplicate', appendIcon: 'Duplicate' },
    {
      children: 'Delete',
      appendIcon: 'Delete',
      style: { color: 'var(--cogs-text-icon--status-critical)' },
    },
  ],
};

export const Open = Template.bind({});
Open.args = Default.args;
Open.play = ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByLabelText('Actions for 1');
  userEvent.click(button);
};

export const Empty = Template.bind({});
Empty.args = {};
