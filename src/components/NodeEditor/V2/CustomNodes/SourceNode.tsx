import { Select } from '@cognite/cogs.js';
import { NodeTypes, SourceOption } from 'models/node-editor/types';
import { memo } from 'react';
import { Position } from 'react-flow-renderer';
import styled from 'styled-components/macro';
import { ColorBlock, InputWrapper, NodeWrapper } from './elements';
import NodeHandle from './NodeHandle';
import NodeWithActionBar from './NodeWithActionBar';

type SourceNodeProps = {
  id: string;
  data: {
    type: string;
    sourceOptions: SourceOption[];
    selectedSourceId: string;
    onSourceItemChange: (
      nodeId: string,
      selectedItemId: string,
      selectedItemType: string
    ) => void;
    onDuplicateNode: (nodeId: string, nodeType: NodeTypes) => void;
    onRemoveNode: (nodeId: string) => void;
  };
  selected: boolean;
};

const SourceNode = memo(({ id, data, selected }: SourceNodeProps) => {
  const {
    selectedSourceId,
    sourceOptions,
    onSourceItemChange,
    onDuplicateNode,
    onRemoveNode,
  } = data;
  const sourceItem =
    sourceOptions.find((s) => s.value === selectedSourceId) || sourceOptions[0];

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
          <ColorBlock color={sourceItem?.color} />
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
