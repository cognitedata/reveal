import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { ReactFlowProvider } from 'react-flow-renderer';
import { mockSourceList } from 'models/workflows/mocks';
import ReactFlowNodeEditor from '../ReactFlowNodeEditor';
import { NodeTypes } from '../types';
import SourceNode from './SourceNode';

export default {
  component: SourceNode,
  title: 'Components/Node Editor/v2/Nodes/Source Node',
} as Meta;

const Template: Story<ComponentProps<typeof SourceNode>> = (args) => (
  <div
    style={{
      width: 'calc(100vw - (100vw - 100%))',
      height: 'calc(100vh - 30px)',
    }}
  >
    <ReactFlowProvider>
      <ReactFlowNodeEditor
        sources={mockSourceList}
        operations={[]}
        settings={{ autoAlign: true }}
        isValid
        onSaveSettings={() => {}}
        onElementsRemove={() => {}}
        onConnect={() => {}}
        onEdgeUpdate={() => {}}
        onNodeDragStop={() => {}}
        onAddSourceNode={() => {}}
        onAddConstantNode={() => {}}
        onAddFunctionNode={() => {}}
        onAddOutputNode={() => {}}
        onMove={() => {}}
        flowElements={[
          {
            ...args,
            type: NodeTypes.SOURCE,
            position: { x: 50, y: 100 },
          },
        ]}
      />
    </ReactFlowProvider>
  </div>
);

export const Default = Template.bind({});
export const ReadOnly = Template.bind({});
export const VeryLongSourceName = Template.bind({});
export const VeryLongSourceNameReadOnly = Template.bind({});

Default.args = {
  id: 'sample',
  data: {
    readOnly: false,
    selectedSourceId: 'a',
    onSourceItemChange: () => {},
    onDuplicateNode: () => {},
    onRemoveNode: () => {},
    sourceOptions: mockSourceList,
  },
  selected: false,
};

ReadOnly.args = {
  id: 'sample',
  data: {
    readOnly: true,
    selectedSourceId: 'b',
    onSourceItemChange: () => {},
    onDuplicateNode: () => {},
    onRemoveNode: () => {},
    sourceOptions: mockSourceList,
  },
  selected: false,
};

VeryLongSourceName.args = {
  id: 'sample',
  data: {
    readOnly: false,
    selectedSourceId: 'd',
    onSourceItemChange: () => {},
    onDuplicateNode: () => {},
    onRemoveNode: () => {},
    sourceOptions: mockSourceList,
  },
  selected: false,
};

VeryLongSourceNameReadOnly.args = {
  id: 'sample',
  data: {
    readOnly: true,
    selectedSourceId: 'd',
    onSourceItemChange: () => {},
    onDuplicateNode: () => {},
    onRemoveNode: () => {},
    sourceOptions: mockSourceList,
  },
  selected: false,
};
