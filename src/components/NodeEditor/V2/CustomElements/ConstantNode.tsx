import { Input } from '@cognite/cogs.js';
import { memo, useState } from 'react';
import { Position } from 'react-flow-renderer';
import styled from 'styled-components/macro';
import { NodeWrapper } from './elements';
import NodeHandle from './NodeHandle';

type ConstantNodeProps = {
  id: string;
  data: {
    value: number;
    onConstantChange: (nodeId: string, newValue: number) => void;
  };
  selected: boolean;
};

const ConstantNode = memo(({ id, data, selected }: ConstantNodeProps) => {
  const { value, onConstantChange } = data;

  const [isInputVisible, setIsInputVisible] = useState<boolean>(false);

  return (
    <NodeWrapper
      className={selected ? 'selected' : ''}
      onDoubleClick={() => setIsInputVisible(!isInputVisible)}
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
  );
});

const Value = styled.div`
  color: var(--cogs-greyscale-grey6);
  font-size: 10px;
  font-weight: 400;
`;

export default ConstantNode;
