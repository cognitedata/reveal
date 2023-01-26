import { Meta, Story } from '@storybook/react';
import { mockWorkflowSchemas } from 'utils/test/mockWorkflowSchemas';
import { ComponentProps } from 'react';
import { WorkflowSchemaTable } from 'components/WorkflowSchemaTable/WorkflowSchemaTable';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export default {
  component: WorkflowSchemaTable,
  title: 'Components/Workflow Schemas Table',
  argTypes: {
    onSave: { action: 'saved' },
    onDelete: { action: 'deleted' },
    onSelect: { action: 'selected' },
    onDuplicate: { action: 'duplicated' },
  },
  args: { data: mockWorkflowSchemas, hasUnsavedChanges: false },
} as Meta;

const Template: Story<ComponentProps<typeof WorkflowSchemaTable>> = (args) => (
  <WorkflowSchemaTable {...args} />
);

export const Default = Template.bind({});

Default.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const nameCell = canvas.getByText(mockWorkflowSchemas[2].name);
  userEvent.click(nameCell);
  expect(args.onSelect).toBeCalledWith(2, false);

  const typeCell = canvas.getByText(mockWorkflowSchemas[0].workflowType);
  userEvent.click(typeCell);
  expect(args.onSelect).toBeCalledWith(0, false);

  const switchElement = await canvas.findAllByRole('cell');
  // eslint-disable-next-line testing-library/no-node-access
  userEvent.click(switchElement[8].children[0]);
  expect(args.onSave).toBeCalledWith({
    ...mockWorkflowSchemas[2],
    enabled: !mockWorkflowSchemas[2].enabled,
  });

  const dropdownButton = canvas.getByLabelText('Actions for 1');
  userEvent.click(dropdownButton);
  const duplicateButton = await canvas.findByText('Duplicate');
  userEvent.click(duplicateButton);
  expect(args.onDuplicate).toBeCalledWith(mockWorkflowSchemas[0]);

  userEvent.click(dropdownButton);
  const deleteButton = await canvas.findByText('Delete');
  userEvent.click(deleteButton);
  expect(args.onDelete).toBeCalledWith(mockWorkflowSchemas[0]);
};
