import { Operation } from '@cognite/calculation-backend';
import { memo, useEffect, useState } from 'react';
import { Position } from 'react-flow-renderer';
import styled from 'styled-components/macro';
import { NodeWrapper } from '../elements';
import NodeHandle from '../NodeHandle';
import FunctionParameterForm from './FunctionParameterForm/FunctionParameterForm';

// Arbitrary min height a pin should span
const PIN_HEIGHT = 22;

type FunctionNodeProps = {
  id: string;
  data: {
    toolFunction: Operation;
    functionData: { [key: string]: any };
    onFunctionDataChange: (
      nodeId: string,
      formData: { [key: string]: any }
    ) => void;
  };
  selected: boolean;
};

const FunctionNode = memo(({ id, data, selected }: FunctionNodeProps) => {
  const { toolFunction, functionData, onFunctionDataChange } = data;
  const nodeHeight = toolFunction.inputs.length * PIN_HEIGHT;

  const [areParamsVisible, setAreParamsVisible] = useState<boolean>(false);

  useEffect(() => {
    setAreParamsVisible(false);
  }, [selected]);

  return (
    <NodeWrapper
      className={selected ? 'selected' : ''}
      style={{
        minHeight: nodeHeight,
        position: 'relative',
        padding: 10,
      }}
      onDoubleClick={() =>
        !!toolFunction.parameters.length &&
        setAreParamsVisible(!areParamsVisible)
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
      {areParamsVisible && !!toolFunction.parameters.length && (
        <FunctionParameterForm
          nodeId={id}
          parameters={toolFunction.parameters}
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
  );
});

const HandleContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  justify-items: center;
  position: absolute;
  bottom: 2px;
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
  line-height: 22px;
  color: var(--cogs-text-color-secondary);
`;

export default FunctionNode;
