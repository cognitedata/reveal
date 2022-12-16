import { Meta, Story } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { WorkflowSchemas } from 'pages/WorkflowSchemas';
import { ComponentProps } from 'react';
import { mockWorkflowSchemas } from 'utils/test/mockWorkflowSchemas';

export default {
  component: WorkflowSchemas,
  title: 'Pages/Workflow Schemas',
  argTypes: {
    onSave: { action: 'saved' },
    onDelete: { action: 'deleted' },
    onCreate: { action: 'created' },
  },
  args: {
    workflowSchemas: mockWorkflowSchemas,
  },
  parameters: {
    layout: 'fullscreen',
    chromatic: { viewports: [1366] },
  },
} as Meta;

const Template: Story<ComponentProps<typeof WorkflowSchemas>> = (args) => {
  return <WorkflowSchemas {...args} />;
};

export const Initial = Template.bind({});

Initial.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/QlY4FXT7nVnGqwRBOr0yPl/PowerOps-%7C-Working-Environment?node-id=1649%3A164358&t=LP3TrXebubh5a8UD-1',
  },
};

export const DropdownOpen = Template.bind({});
DropdownOpen.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/QlY4FXT7nVnGqwRBOr0yPl/PowerOps-%7C-Working-Environment?node-id=1674%3A166514&t=gmYOFxRC7fjxytRb-1',
  },
};
DropdownOpen.play = ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByLabelText('Actions for 1');
  userEvent.click(button);
};

export const CodeValidUnchanged = Template.bind({});
CodeValidUnchanged.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/QlY4FXT7nVnGqwRBOr0yPl/PowerOps-%7C-Working-Environment?node-id=1657%3A165105&t=ur3BOzjr0yU8hEzN-1',
  },
};
CodeValidUnchanged.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const editCell = canvas.getByText('Day-Ahead Bid Matrix Calculation');
  userEvent.click(editCell);
};
