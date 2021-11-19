import { Operation } from '@cognite/calculation-backend';
import { NodeTypes } from 'models/node-editor/types';
import { memo, useEffect, useState } from 'react';
import { Position } from 'react-flow-renderer';
import styled from 'styled-components/macro';
import { AUTO_ALIGN_PARAM } from 'utils/constants';
import { NodeWrapper } from '../elements';
import NodeHandle from '../NodeHandle';
import NodeWithActionBar from '../NodeWithActionBar';
import FunctionParameterForm from './FunctionParameterForm/FunctionParameterForm';

// Arbitrary min height a pin should span
const PIN_HEIGHT = 24;

type FunctionNodeProps = {
  id: string;
  data: {
    toolFunction: Operation;
    functionData: { [key: string]: any };
    onFunctionDataChange: (
      nodeId: string,
      formData: { [key: string]: any }
    ) => void;
    onDuplicateNode: (nodeId: string, nodeType: NodeTypes) => void;
    onRemoveNode: (nodeId: string) => void;
  };
  selected: boolean;
};

const FunctionNode = memo(({ id, data, selected }: FunctionNodeProps) => {
  const {
    toolFunction,
    functionData,
    onFunctionDataChange,
    onDuplicateNode,
    onRemoveNode,
  } = data;
  const nodeHeight = toolFunction.inputs.length * PIN_HEIGHT;
  // Remove auto-align parameter so it's not rendered in the form
  const parameters = toolFunction.parameters.filter(
    (p) => p.param !== AUTO_ALIGN_PARAM
  );

  const [areParamsVisible, setAreParamsVisible] = useState<boolean>(false);

  useEffect(() => {
    setAreParamsVisible(false);
  }, [selected]);

  return (
    <NodeWithActionBar
      nodeType={NodeTypes.FUNCTION}
      toolFunction={toolFunction}
      isActionBarVisible={selected}
      onEditClick={() => {
        setAreParamsVisible((isVisible) => !isVisible);
      }}
      onDuplicateClick={() => onDuplicateNode(id, NodeTypes.CONSTANT)}
      onRemoveClick={() => onRemoveNode(id)}
    >
      <NodeWrapper
        className={selected ? 'selected' : ''}
        style={{
          minHeight: nodeHeight,
          position: 'relative',
          padding: 10,
        }}
        onDoubleClick={() =>
          parameters.length && setAreParamsVisible((isVisible) => !isVisible)
        }
      >
        <HandleContainer height={nodeHeight} position="left">
          {toolFunction.inputs.map((input) => (
            <FunctionNodeHandle
              key={input.param}
              id={`${input.param}`}
              type="target"
              position={Position.Left}
            />
          ))}
        </HandleContainer>
        <FunctionName>{toolFunction.name}</FunctionName>
        {!areParamsVisible &&
          toolFunction.inputs.map((input, i) => (
            <InputName key={input.name}>
              {input.name || `Input ${i + 1}`}
            </InputName>
          ))}
        {areParamsVisible && !!parameters.length && (
          <FunctionParameterForm
            nodeId={id}
            parameters={parameters}
            functionData={functionData}
            onFunctionDataChange={(nodeId, formData) => {
              onFunctionDataChange(nodeId, formData);
              setAreParamsVisible(false);
            }}
          />
        )}
        {/*
         * TODO: Support multiple outputs
         * Assuming all functions have only one output for now
         */}
        <HandleContainer height={nodeHeight} position="right">
          <FunctionNodeHandle
            id="out-result"
            type="source"
            position={Position.Right}
          />
        </HandleContainer>
      </NodeWrapper>
    </NodeWithActionBar>
  );
});

const HandleContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  justify-items: center;
  position: absolute;
  bottom: -3px;
  height: ${(props: { height?: number; position: 'left' | 'right' }) =>
    props.height}px;
  left: ${(props: { height?: number; position: 'left' | 'right' }) =>
    props.position === 'left' ? '-4px' : 'unset'};
  right: ${(props: { height?: number; position: 'left' | 'right' }) =>
    props.position === 'right' ? '-4px' : 'unset'};
  pointer-events: all;
`;

const FunctionNodeHandle = styled(NodeHandle)`
  position: unset;
`;

const FunctionName = styled.span`
  font-weight: 500;
`;

const InputName = styled.span`
  font-size: 10px;
  font-weight: 400;
  line-height: 24px;
  color: var(--cogs-text-color-secondary);
`;

export default FunctionNode;
