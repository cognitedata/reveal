import { Select } from '@cognite/cogs.js';
import { memo, useState } from 'react';
import { NodeProps, Position } from 'react-flow-renderer';
import styled from 'styled-components/macro';
import { NodeTypes, SourceOption } from '../types';
import {
  ColorBlock,
  InputWrapper,
  NodeWrapper,
  NoDragWrapper,
} from './elements';
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
    readOnly: boolean;
  };

const emptySourceOption: SourceOption = {
  type: 'timeseries',
  label: 'No source selected',
  color: '#F00',
  value: '',
};

const SourceNode = memo(({ id, data, selected }: NodeProps<SourceNodeData>) => {
  const {
    readOnly,
    selectedSourceId,
    sourceOptions,
    onSourceItemChange,
    onDuplicateNode,
    onRemoveNode,
  } = data;

  const sourceItem =
    sourceOptions.find((s) => s.value === selectedSourceId) ||
    emptySourceOption;
  const [isInputVisible, setIsInputVisible] = useState(true);

  return (
    <NodeWithActionBar
      capabilities={{
        canDuplicate: !readOnly,
        canEdit: !readOnly,
        canRemove: !readOnly,
        canSeeInfo: false,
      }}
      actions={{
        onEditClick: () => setIsInputVisible(!isInputVisible),
        onDuplicateClick: () => onDuplicateNode(id, NodeTypes.SOURCE),
        onRemoveClick: () => onRemoveNode(id),
      }}
      status={{ isEditing: isInputVisible }}
      isActionBarVisible={selected && !readOnly}
    >
      <NodeWrapper className={selected ? 'selected' : ''}>
        <span>Source</span>
        <NodeHandle id="result" type="source" position={Position.Right} />
        {readOnly || !isInputVisible ? (
          sourceItem.label
        ) : (
          <InputWrapper>
            <ColorBlock color={sourceItem.color} />
            <SelectWrapper>
              <NoDragWrapper>
                <Select
                  value={sourceItem}
                  options={sourceOptions}
                  onChange={(option: SourceOption) =>
                    onSourceItemChange(id, option.value, option.type)
                  }
                  closeMenuOnSelect
                />
              </NoDragWrapper>
            </SelectWrapper>
          </InputWrapper>
        )}
      </NodeWrapper>
    </NodeWithActionBar>
  );
});

const SelectWrapper = styled.div`
  width: 230px;
`;

export default SourceNode;
