import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { ReactFlowProvider } from 'react-flow-renderer';
import { defaultTranslations } from 'components/NodeEditor/translations';
import ReactFlowNodeEditor from '../ReactFlowNodeEditor';
import { NodeTypes } from '../types';
import OutputNode from './OutputNode';

export default {
  component: OutputNode,
  title: 'Components/Node Editor/v2/Nodes/Output Node',
} as Meta;

const Template: Story<ComponentProps<typeof OutputNode>> = (args) => (
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
            type: NodeTypes.OUTPUT,
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
export const VeryLongOutputName = Template.bind({});
export const VeryLongOutputNameReadOnly = Template.bind({});

Default.args = {
  id: 'sample',
  data: {
    readOnly: false,
    onOutputNameChange: () => {},
    color: '#FF0000',
    name: 'Test Output Time Series',
    translations: defaultTranslations,
  },
  selected: false,
};

ReadOnly.args = {
  ...Default.args,
  data: {
    ...Default.args.data!,
    readOnly: true,
  },
};

VeryLongOutputName.args = {
  ...Default.args,
  data: {
    ...Default.args.data!,
    name: 'This output intentionally has a very long input name to test how it renders in the browser',
  },
};

VeryLongOutputNameReadOnly.args = {
  ...VeryLongOutputName.args,
  data: {
    ...VeryLongOutputName.args.data!,
    readOnly: true,
  },
};
