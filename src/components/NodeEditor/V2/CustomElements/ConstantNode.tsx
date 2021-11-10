import { Input } from '@cognite/cogs.js';
import { NodeTypes } from 'models/node-editor/types';
import { memo, useState } from 'react';
import { Position } from 'react-flow-renderer';
import styled from 'styled-components/macro';
import { NodeWrapper } from './elements';
import NodeHandle from './NodeHandle';
import NodeWithActionBar from './NodeWithActionBar';

type ConstantNodeProps = {
  id: string;
  data: {
    value: number;
    onConstantChange: (nodeId: string, newValue: number) => void;
    onDuplicateNode: (nodeId: string, nodeType: NodeTypes) => void;
    onRemoveNode: (nodeId: string) => void;
  };
  selected: boolean;
};

const ConstantNode = memo(({ id, data, selected }: ConstantNodeProps) => {
  const { value, onConstantChange, onDuplicateNode, onRemoveNode } = data;

  const [isInputVisible, setIsInputVisible] = useState<boolean>(false);

  return (
    <NodeWithActionBar
      nodeType={NodeTypes.CONSTANT}
      isActionBarVisible={selected}
      onEditClick={() => {
        setIsInputVisible((isVisible) => !isVisible);
      }}
      onDuplicateClick={() => onDuplicateNode(id, NodeTypes.CONSTANT)}
      onRemoveClick={() => onRemoveNode(id)}
    >
      <NodeWrapper
        className={selected ? 'selected' : ''}
        onDoubleClick={() => setIsInputVisible((isVisible) => !isVisible)}
      >
        <NodeHandle type="source" position={Position.Right} />
        <span>Constant</span>
        {!isInputVisible && <Value>{value}</Value>}
        {isInputVisible && (
          <Input
            value={value}
            type="number"
            onChange={(event) => {
              onConstantChange(id, Number(event.target.value));
            }}
          />
        )}
      </NodeWrapper>
    </NodeWithActionBar>
  );
});

const Value = styled.div`
  color: var(--cogs-greyscale-grey6);
  font-size: 10px;
  font-weight: 400;
`;

export default ConstantNode;
