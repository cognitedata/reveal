import { Button, Input } from '@cognite/cogs.js';
import React, { useEffect, useState } from 'react';
import { StorableNode } from 'reducers/charts/types';
import defaultNodeOptions from 'reducers/charts/Nodes';
import styled from 'styled-components/macro';

const ConfigPanelWrapper = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  width: 300px;
  padding: 12px;
  border-radius: 6px;
  background: var(--cogs-greyscale-grey9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);

  footer {
    display: flex;
    padding-top: 16px;
    justify-content: space-between;
  }
  .close-btn {
    color: white;
    box-shadow: none;
  }

  .config-panel {
    margin-top: 16px;
  }

  h4 {
    color: white;
    opacity: 0.8;
  }

  input {
    background: var(--cogs-greyscale-grey10);
    color: white;
    border: black;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3) inset;
    &:hover {
      background: var(--cogs-greyscale-grey10) !important;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.6) inset;
    }
    &:focus {
      background: var(--cogs-greyscale-grey10) !important;
    }
  }
`;

type ConfigPanelProps = {
  node: StorableNode;
  onRemove: (oldNode: StorableNode) => void;
  onSave: (nextNode: StorableNode) => void;
  onClose: () => void;
  context: any;
};

const ConfigPanel = ({
  node,
  onRemove,
  onSave,
  onClose,
  context,
}: ConfigPanelProps) => {
  const [workingNode, setWorkingNode] = useState<StorableNode>(node);
  const [isDirty, setDirty] = useState(false);

  useEffect(() => {
    if (node.id !== workingNode.id) {
      setWorkingNode(node);
    }
  }, [node, workingNode.id]);

  const NodeSpecificConfigPanel = defaultNodeOptions.find(
    (opt) => opt.effectId === node?.functionEffectReference
  )?.configPanel;

  return (
    <ConfigPanelWrapper>
      <Button
        unstyled
        className="close-btn"
        style={{ position: 'absolute', top: 8, right: 8 }}
        icon="Close"
        onClick={() => {
          onClose();
        }}
        aria-label="close"
      />
      <Input
        value={workingNode.title}
        onChange={(e) => {
          setDirty(true);
          setWorkingNode({ ...node, title: e.target.value });
        }}
        className="name-input"
      />
      {NodeSpecificConfigPanel && (
        <div className="config-panel">
          {React.createElement(NodeSpecificConfigPanel, {
            node: workingNode,
            onUpdateNode: (nextNode: StorableNode) => {
              setDirty(true);
              setWorkingNode({
                ...workingNode,
                ...nextNode,
              });
            },
            context,
          })}
        </div>
      )}

      <footer>
        <Button
          type="ghost"
          className="remove-btn"
          style={{ color: 'white' }}
          onClick={() => {
            onRemove(workingNode);
          }}
        >
          Remove
        </Button>
        <Button
          type="primary"
          disabled={!isDirty}
          onClick={() => {
            setDirty(false);
            onSave(workingNode);
          }}
          className="save-btn"
        >
          Save
        </Button>
      </footer>
    </ConfigPanelWrapper>
  );
};

export default ConfigPanel;
