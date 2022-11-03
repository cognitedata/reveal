import { Meta, Story } from '@storybook/react';
import { WorkflowSchemaEditor } from 'components/WorkflowSchemaEditor/WorkflowSchemaEditor';
import { mockWorkflowSchemas } from 'utils/test/mockWorkflowSchemas';
import { ComponentProps } from 'react';
import { convertWorkflowSchemaToEditable } from 'pages/WorkflowSchemas/utils';

export default {
  component: WorkflowSchemaEditor,
  title: 'Components/Workflow Schema Editor',
  argTypes: { onSave: { action: 'saved' } },
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const Template: Story<ComponentProps<typeof WorkflowSchemaEditor>> = (args) => (
  <WorkflowSchemaEditor {...args} />
);

export const Example1 = Template.bind({});

Example1.storyName = mockWorkflowSchemas[0].name;
Example1.args = {
  value: convertWorkflowSchemaToEditable(mockWorkflowSchemas[0]),
};

export const Example2 = Template.bind({});

Example2.storyName = mockWorkflowSchemas[1].name;
Example2.args = {
  value: convertWorkflowSchemaToEditable(mockWorkflowSchemas[1]),
};

export const Example3 = Template.bind({});

Example3.storyName = mockWorkflowSchemas[2].name;
Example3.args = {
  value: convertWorkflowSchemaToEditable(mockWorkflowSchemas[2]),
};

export const Example4 = Template.bind({});

Example4.storyName = mockWorkflowSchemas[3].name;
Example4.args = {
  value: convertWorkflowSchemaToEditable(mockWorkflowSchemas[3]),
};
