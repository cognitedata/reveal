import { ComponentProps } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';

import { Meta, Story } from '@storybook/react';

import { defaultTranslations } from '../../translations';
import ReactFlowNodeEditor from '../ReactFlowNodeEditor';
import { NodeTypes } from '../types';

import ConstantNode from './ConstantNode';

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
    {/* 
    todo(DEGR-2397) react 18 has FC without children
    eslint-disable-next-line
    @ts-ignore*/}
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
        onErrorIconClick={() => {}}
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
