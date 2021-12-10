import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { ReactFlowProvider } from 'react-flow-renderer';
import EditorControls from './EditorControls';

export default {
  component: EditorControls,
  title: 'Components/Node Editor/v2/Editor Controls',
} as Meta;

const Template: Story<ComponentProps<typeof EditorControls>> = (args) => (
  <ReactFlowProvider>
    <EditorControls {...args} />
  </ReactFlowProvider>
);

export const AutoAlignOff = Template.bind({});
export const AutoAlignOn = Template.bind({});
export const ReadOnly = Template.bind({});

AutoAlignOn.args = {
  settings: { autoAlign: true },
};

AutoAlignOff.args = {
  settings: { autoAlign: false },
};

ReadOnly.args = {
  settings: { autoAlign: false },
  readOnly: true,
};
