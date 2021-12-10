import { Input } from '@cognite/cogs.js';
import { memo, useState } from 'react';
import { NodeProps, Position } from 'react-flow-renderer';
import styled from 'styled-components/macro';
import { NodeTypes } from '../types';
import { NodeWrapper } from './elements';
import NodeHandle from './NodeHandle';
import NodeWithActionBar from './NodeWithActionBar';

export type ConstantNodeDataDehydrated = {
  value: number;
  readOnly: boolean;
};

export type ConstantNodeCallbacks = {
  onConstantChange: (nodeId: string, newValue: number) => void;
  onDuplicateNode: (nodeId: string, nodeType: NodeTypes) => void;
  onRemoveNode: (nodeId: string) => void;
};

export type ConstantNodeData = ConstantNodeDataDehydrated &
  ConstantNodeCallbacks & {};

const ConstantNode = memo(
  ({ id, data, selected }: NodeProps<ConstantNodeData>) => {
    const { value, readOnly, onConstantChange, onDuplicateNode, onRemoveNode } =
      data;

    const [isInputVisible, setIsInputVisible] = useState<boolean>(false);

    return (
      <NodeWithActionBar
        isActionBarVisible={selected && !readOnly}
        actions={{
          onEditClick: () => setIsInputVisible((isVisible) => !isVisible),
          onDuplicateClick: () => onDuplicateNode(id, NodeTypes.CONSTANT),
          onRemoveClick: () => onRemoveNode(id),
        }}
        capabilities={{
          canEdit: true,
          canDuplicate: true,
          canRemove: true,
          canSeeInfo: false,
        }}
        status={{
          isEditing: isInputVisible,
        }}
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
  }
);

const Value = styled.div`
  color: var(--cogs-greyscale-grey6);
  font-size: 10px;
  font-weight: 400;
`;

export default ConstantNode;
