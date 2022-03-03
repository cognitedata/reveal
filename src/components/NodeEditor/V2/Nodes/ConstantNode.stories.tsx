import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { ReactFlowProvider } from 'react-flow-renderer';
import { defaultTranslations } from 'components/NodeEditor/translations';
import ConstantNode from './ConstantNode';
import ReactFlowNodeEditor from '../ReactFlowNodeEditor';
import { NodeTypes } from '../types';

export default {
  component: ConstantNode,
  title: 'Components/Node Editor/v2/Nodes/Constant Node',
} as Meta;

const Template: Story<ComponentProps<typeof ConstantNode>> = (args) => (
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
            type: NodeTypes.CONSTANT,
            position: { x: 50, y: 100 },
          },
        ]}
        translations={defaultTranslations}
      />
    </ReactFlowProvider>
  </div>
);

export const Default = Template.bind({});
export const ReadOnly = Template.bind({});

Default.args = {
  id: 'sample',
  data: {
    readOnly: false,
    value: 1,
    onConstantChange: () => {},
    onDuplicateNode: () => {},
    onRemoveNode: () => {},
    translations: defaultTranslations,
  },
  selected: false,
};

ReadOnly.args = {
  id: 'sample',
  data: {
    readOnly: true,
    value: 1,
    onConstantChange: () => {},
    onDuplicateNode: () => {},
    onRemoveNode: () => {},
    translations: defaultTranslations,
  },
  selected: false,
};
