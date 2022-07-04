import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { fullListOfOperations } from 'models/calculation-backend/operations/mocks';
import { ReactFlowProvider } from 'react-flow-renderer';
import { defaultTranslations } from 'components/NodeEditor/translations';
import { Operation } from '@cognite/calculation-backend';
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
            type: NodeTypes.FUNCTION,
            position: { x: 50, y: 100 },
          },
        ]}
        translations={defaultTranslations}
      />
    </ReactFlowProvider>
  </div>
);

export const AddFunction = Template.bind({});
export const ExtremeOutliersFunction = Template.bind({});

const addFunctionMock = fullListOfOperations.find(
  ({ op }) => op === 'add'
) as Operation;

AddFunction.args = {
  id: 'sample',
  data: {
    selectedOperation: {
      op: addFunctionMock.op,
      version: addFunctionMock.versions[0].version,
    },
    operation: addFunctionMock,
    parameterValues: {},
    onParameterValuesChange: () => {},
    onDuplicateNode: () => {},
    onRemoveNode: () => {},
    readOnly: false,
    translations: defaultTranslations,
  },
  selected: true,
};

ExtremeOutliersFunction.args = {
  id: 'sample',
  data: {
    selectedOperation: {
      op: fullListOfOperations[0].op,
      version: fullListOfOperations[0].versions[0].version,
    },
    operation: fullListOfOperations[0],
    parameterValues: {},
    onParameterValuesChange: () => {},
    onDuplicateNode: () => {},
    onRemoveNode: () => {},
    readOnly: false,
    translations: defaultTranslations,
  },
  selected: false,
};
