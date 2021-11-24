import { Meta, Story } from '@storybook/react';
import ReactFlowNodeEditor, {
  ReactFlowNodeEditorProps,
} from './ReactFlowNodeEditor';

export default {
  component: ReactFlowNodeEditor,
  title: 'Components/Node Editor/v2',
} as Meta;

const Template: Story<ReactFlowNodeEditorProps> = (args) => (
  <div style={{ width: 'calc(100vw - 30px)', height: 'calc(100vh - 30px)' }}>
    <ReactFlowNodeEditor {...args} />
  </div>
);

export const EmptyEditor = Template.bind({});

EmptyEditor.args = {
  sources: [],
  operations: [false, undefined, []],
  output: { id: 'abc', name: 'Calcualtion', color: '#FF0000' },
  getSavedFlow: () => undefined,
};
