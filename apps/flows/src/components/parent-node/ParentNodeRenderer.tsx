import { ChangeEventHandler, FocusEventHandler, useState } from 'react';
import { NodeProps } from 'reactflow';

import styled from 'styled-components';

import { DEFAULT_GROUP_NAME } from '@flows/common';
import { useWorkflowBuilderContext } from '@flows/contexts/WorkflowContext';

import { Colors } from '@cognite/cogs.js';

export const ParentNodeRenderer = ({
  data,
  id,
  selected,
}: NodeProps): JSX.Element => {
  const { changeNodes } = useWorkflowBuilderContext();

  const [groupLabel, setGroupLabel] = useState(data.label);

  const handleLabelChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setGroupLabel(e.target.value);
  };

  const handleLabelBlur: FocusEventHandler<HTMLInputElement> = () => {
    const nextLabel = groupLabel || DEFAULT_GROUP_NAME;
    changeNodes((nodes) => {
      const node = nodes.find((node) => node.id === id);
      if (node?.type === 'parent') {
        node.data.label = nextLabel;
      }
    });
    setGroupLabel(nextLabel);
  };

  return (
    <NodeContainer
      className={selected ? 'workflow-builder-node-selected' : undefined}
    >
      <GroupLabelContainer data-value={groupLabel}>
        <GroupLabel
          onChange={handleLabelChange}
          onBlur={handleLabelBlur}
          value={groupLabel}
        />
      </GroupLabelContainer>
    </NodeContainer>
  );
};

const NodeContainer = styled.div`
  background-color: ${Colors['surface--status-neutral--muted--default--alt']};
  border: 1px solid ${Colors['border--status-neutral--muted']};
  border-radius: 2px;
  position: relative;
  width: 100%;
  height: 100%;
  &.workflow-builder-node-selected {
    background-color: ${Colors['surface--status-neutral--muted--default']};
    border-color: ${Colors['border--status-neutral--strong']};
  }
`;

const GroupLabelContainer = styled.label`
  display: inline-grid;
  vertical-align: top;
  align-items: center;
  position: relative;
  background-color: ${Colors['surface--status-neutral--strong--default']};
  border: none;
  border-radius: 2px;
  color: ${Colors['text-icon--strong--inverted']};
  font-size: 14px;
  height: 24px;
  position: absolute;
  top: -32px;
  left: 0;
  width: min-content;
  .workflow-builder-node-selected & {
    background-color: ${Colors['surface--status-neutral--strong--pressed']};
  }
  &::after {
    content: attr(data-value);
    display: inline-block;
    font-variant-numeric: normal;
    font-weight: 500;
    grid-area: 1 / 2;
    padding: 0 4px;
    white-space: pre;
    width: min-content;
    visibility: hidden;
  }
`;

const GroupLabel = styled.input`
  background-color: inherit;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  height: 100%;
  grid-area: 1 / 2;
  padding: 0 4px 1px;
  outline: none;
  min-width: 9px;
  width: auto;
  vertical-align: top;
  line-height: 100%;
`;
