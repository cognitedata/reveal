import React, { useState } from 'react';
import styled from 'styled-components/macro';
import {
  SourceNode,
  ControllerProvider,
  Node,
  Connection,
  NodeProgress,
  NodeContainer,
} from '@cognite/connect';
import { Menu, Input, Button } from '@cognite/cogs.js';
import { nanoid } from 'nanoid';
import workflowBackgroundSrc from 'assets/workflowBackground.png';
import useSelector from 'hooks/useSelector';
import workflowSlice, {
  LatestWorkflowRun,
  StorableNode,
  workflowSelectors,
} from 'reducers/workflows';
import useDispatch from 'hooks/useDispatch';
import { saveExistingWorkflow } from 'reducers/workflows/api';
import { runWorkflow } from 'reducers/workflows/utils';
import { pinTypes, isWorkflowRunnable } from './utils';
import defaultNodeOptions from '../../reducers/workflows/Nodes';

const WorkflowContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;

  .node-container {
    background: url(${workflowBackgroundSrc}) #404040;
  }
`;

type WorkflowEditorProps = {
  workflowId?: string;
};

const WorkflowEditor = ({ workflowId }: WorkflowEditorProps) => {
  console.log(workflowId);
  const dispatch = useDispatch();
  const [activeNode, setActiveNode] = useState<Node>();
  const [runProgress, setRunProgress] = useState<NodeProgress>({});

  const workflow = useSelector((state) =>
    workflowSelectors.selectById(state, workflowId || '')
  );
  const { nodes = [], connections = [] } = workflow || {};

  const setConnections = (nextConnections: Record<string, Connection>) => {
    if (workflowId) {
      dispatch(
        workflowSlice.actions.updateWorkflow({
          id: workflowId,
          changes: { connections: nextConnections },
        })
      );
    }
  };

  const setNodes = (nextNodes: StorableNode[]) => {
    if (workflowId) {
      dispatch(
        workflowSlice.actions.updateWorkflow({
          id: workflowId,
          changes: { nodes: nextNodes },
        })
      );
    }
  };

  const onUpdateNode = (nextNode: Node) => {
    setNodes(nodes.map((node) => (node.id === nextNode.id ? nextNode : node)));
  };

  const onNewNode = (newNode: Node) => {
    setNodes([...nodes, newNode]);
  };

  const onSave = async () => {
    if (workflow) {
      dispatch(saveExistingWorkflow(workflow));
    }
  };

  const onRun = async () => {
    if (!workflow) {
      return;
    }
    setRunProgress({});
    const finalResult = await runWorkflow(
      workflow,
      (nextProgress: NodeProgress) => {
        setRunProgress((prev: NodeProgress) => ({
          ...prev,
          ...nextProgress,
        }));
      }
    );
    const latestRun: LatestWorkflowRun = {
      ...finalResult,
      nodeProgress: runProgress,
    };
    dispatch(
      workflowSlice.actions.updateWorkflow({
        id: workflow.id,
        changes: {
          latestRun,
        },
      })
    );
    console.log('FINAL RESULT:', finalResult);
  };

  if (!workflowId) {
    return <div>Select a workflow</div>;
  }

  if (!workflow) {
    return <div>This workflow does not exist (maybe we need to load it?)</div>;
  }

  return (
    <WorkflowContainer>
      <ControllerProvider
        pinTypes={pinTypes}
        connections={connections}
        onConnectionsUpdate={setConnections}
      >
        <NodeContainer
          contextMenu={(
            onClose: Function,
            nodePosition: { x: number; y: number }
          ) => (
            <Menu>
              <Menu.Item>
                <Input />
              </Menu.Item>
              {Object.values(defaultNodeOptions).map((nodeOption) => (
                <Menu.Item
                  onClick={() => {
                    onNewNode({
                      id: `${nodeOption.node.subtitle}-${nanoid()}`,
                      ...nodeOption.node,
                      ...nodePosition,
                    });
                    onClose();
                  }}
                >
                  {nodeOption.name}
                </Menu.Item>
              ))}
            </Menu>
          )}
        >
          {nodes.map((node) => (
            <SourceNode
              node={{ ...node, selected: node.id === activeNode?.id }}
              status={runProgress?.[node.id]}
              onUpdate={onUpdateNode}
              onClick={(clickedNode: Node) => {
                setActiveNode(clickedNode);
              }}
            />
          ))}
        </NodeContainer>
      </ControllerProvider>

      <Button
        type="primary"
        style={{ position: 'absolute', top: 16, right: 16 }}
        onClick={onSave}
      >
        Save
      </Button>

      <Button
        type="primary"
        style={{ position: 'absolute', bottom: 16, right: 16 }}
        disabled={!isWorkflowRunnable(nodes || [])}
        onClick={onRun}
      >
        Run
      </Button>
    </WorkflowContainer>
  );
};

export default WorkflowEditor;
