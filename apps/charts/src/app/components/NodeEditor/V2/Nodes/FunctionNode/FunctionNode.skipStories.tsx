import { ComponentProps } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';

import { Meta, Story } from '@storybook/react';

import { Operation } from '@cognite/calculation-backend';

import { fullListOfOperations } from '../../../../../models/operations/mocks';
import { defaultTranslations } from '../../../translations';
import ReactFlowNodeEditor from '../../ReactFlowNodeEditor';
import { NodeTypes } from '../../types';

import FunctionNode from './FunctionNode';

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
