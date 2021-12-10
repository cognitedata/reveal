import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import WorkflowSettings from './WorkflowSettings';

export default {
  component: WorkflowSettings,
  title: 'Components/Node Editor/v2/Workflow Settings',
} as Meta;

const Template: Story<ComponentProps<typeof WorkflowSettings>> = (args) => (
  <WorkflowSettings {...args} />
);

export const Normal = Template.bind({});
export const ReadOnlyAutoAlignOn = Template.bind({});
export const ReadOnlyAutoAlignOff = Template.bind({});

Normal.args = {
  settings: { autoAlign: true },
  onSaveSettings: () => {},
};

ReadOnlyAutoAlignOn.args = {
  settings: { autoAlign: true },
  readOnly: true,
};

ReadOnlyAutoAlignOff.args = {
  settings: { autoAlign: false },
  readOnly: true,
};
