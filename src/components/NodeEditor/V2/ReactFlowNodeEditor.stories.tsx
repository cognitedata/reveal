import { Meta, Story } from '@storybook/react';
import ReactFlowNodeEditor, {
  ReactFlowNodeEditorProps,
} from './ReactFlowNodeEditor';

export default {
  component: ReactFlowNodeEditor,
  title: 'Components/Node Editor/v2',
} as Meta;

const Template: Story<ReactFlowNodeEditorProps> = (args) => (
  <ReactFlowNodeEditor {...args} />
);

export const EmptyEditor = Template.bind({});

EmptyEditor.args = {
  sources: [],
  output: {},
  getSavedFlow: () => undefined,
};
