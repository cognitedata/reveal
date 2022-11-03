import { Meta, Story } from '@storybook/react';
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
} as Meta;

const Template: Story<ComponentProps<typeof WorkflowSchemas>> = (args) => {
  return <WorkflowSchemas {...args} />;
};

export const Page = Template.bind({});

Page.args = {
  workflowSchemas: mockWorkflowSchemas,
};
