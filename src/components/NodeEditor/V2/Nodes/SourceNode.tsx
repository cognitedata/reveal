import { Select } from '@cognite/cogs.js';
import { memo } from 'react';
import { NodeProps, Position } from 'react-flow-renderer';
import styled from 'styled-components/macro';
import { NodeTypes, SourceOption } from '../types';
import { ColorBlock, InputWrapper, NodeWrapper } from './elements';
import NodeHandle from './NodeHandle';
import NodeWithActionBar from './NodeWithActionBar';

export type SourceNodeDataDehydrated = {
  selectedSourceId: string;
  type?: string;
};

export type SourceNodeCallbacks = {
  onSourceItemChange: (
    nodeId: string,
    selectedItemId: string,
    selectedItemType: string
  ) => void;
  onDuplicateNode: (nodeId: string, nodeType: NodeTypes) => void;
  onRemoveNode: (nodeId: string) => void;
};

export type SourceNodeData = SourceNodeDataDehydrated &
  SourceNodeCallbacks & {
    sourceOptions: SourceOption[];
  };

const emptySourceOption: SourceOption = {
  type: 'timeseries',
  label: 'No source selected',
  color: '#FFF',
  value: '',
};

const SourceNode = memo(({ id, data, selected }: NodeProps<SourceNodeData>) => {
  const {
    selectedSourceId,
    sourceOptions,
    onSourceItemChange,
    onDuplicateNode,
    onRemoveNode,
  } = data;

  const sourceItem =
    sourceOptions.find((s) => s.value === selectedSourceId) ||
    emptySourceOption;

  return (
    <NodeWithActionBar
      nodeType={NodeTypes.SOURCE}
      isActionBarVisible={selected}
      onDuplicateClick={() => {
        onDuplicateNode(id, NodeTypes.SOURCE);
      }}
      onRemoveClick={() => {
        onRemoveNode(id);
      }}
    >
      <NodeWrapper className={selected ? 'selected' : ''}>
        <div>Source</div>
        <NodeHandle id="result" type="source" position={Position.Right} />
        <InputWrapper>
          <ColorBlock color={sourceItem.color} />
          <SelectWrapper>
            <Select
              value={sourceItem}
              options={sourceOptions}
              onChange={(option: SourceOption) =>
                onSourceItemChange(id, option.value, option.type)
              }
              closeMenuOnSelect
            />
          </SelectWrapper>
        </InputWrapper>
      </NodeWrapper>
    </NodeWithActionBar>
  );
});

const SelectWrapper = styled.div`
  width: 230px;
`;

export default SourceNode;
