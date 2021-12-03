import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { fullListOfOperations } from 'models/operations/mocks';
import { ReactFlowProvider } from 'react-flow-renderer';
import FunctionNode from './FunctionNode';
import ReactFlowNodeEditor from '../../ReactFlowNodeEditor';
import { NodeTypes } from '../../types';

export default {
  component: FunctionNode,
  title: 'Components/Node Editor/v2/Nodes/Function Node',
} as Meta;

const Template: Story<ComponentProps<typeof FunctionNode>> = (args) => (
  <div
    style={{
      width: 'calc(100vw - (100vw - 100%))',
      height: 'calc(100vh - 30px)',
    }}
  >
    <ReactFlowProvider>
      <ReactFlowNodeEditor
        sources={[]}
        operations={[]}
        autoAlign
        isValid
        onToggleAutoAlign={() => {}}
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
            type: NodeTypes.FUNCTION,
            position: { x: 50, y: 100 },
          },
        ]}
      />
    </ReactFlowProvider>
  </div>
);

export const Default = Template.bind({});

Default.args = {
  id: 'sample',
  data: {
    toolFunction: fullListOfOperations[27],
    functionData: {},
    onFunctionDataChange: () => {},
    onDuplicateNode: () => {},
    onRemoveNode: () => {},
  },
  selected: false,
};
