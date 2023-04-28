import { useState } from 'react';

import { Extend as AutomergeExtend, uuid } from '@automerge/automerge';
import {
  Button,
  Colors,
  Dropdown,
  Elevations,
  Flex,
  Icon,
  Menu,
  Overline,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { Edge, Handle, NodeProps, Position } from 'reactflow';

import { useTranslation } from 'common';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { PROCESS_ICON, ProcessNode, ProcessNodeData, ProcessType } from 'types';

const BASE_NODE_HANDLE_SIZE = 16;

export const ProcessNodeRenderer = ({
  data,
  id,
  selected,
  xPos,
  yPos,
}: NodeProps<ProcessNodeData>): JSX.Element => {
  const { t } = useTranslation();

  const [isLeftDropdownVisible, setIsLeftDropdownVisible] = useState(false);
  const [isRightDropdownVisible, setIsRightDropdownVisible] = useState(false);

  const { changeEdges, changeNodes, edges } = useWorkflowBuilderContext();

  const hasSource = edges.some((edge) => edge.target === id);
  const hasTarget = edges.some((edge) => edge.source === id);

  const handleAddNode = (
    processType: ProcessType,
    direction: 'left' | 'right'
  ): void => {
    const node: AutomergeExtend<ProcessNode> = {
      id: uuid(),
      type: 'process',
      position: {
        x: xPos + 400 * (direction === 'left' ? -1 : 1), // FIXME: use constant for 400
        y: yPos,
      },
      data: {
        processType,
        processDescription: '',
        processProps: {},
      },
    };

    // FIXME: any
    const edge: AutomergeExtend<Edge<any>> = {
      id: uuid(),
      source: direction === 'left' ? node.id : id,
      target: direction === 'left' ? id : node.id,
      type: 'default',
    };

    changeNodes((nodes) => {
      nodes.push(node);
    });
    changeEdges((edges) => {
      edges.push(edge);
    });
  };

  return (
    <ProcessNodeContainer
      className={selected ? 'workflow-builder-node-selected' : undefined}
    >
      <ProcessNodeContent>
        <BaseHandleLeft position={Position.Left} type="target" />
        <BaseHandleRight position={Position.Right} type="source" />
        <Flex gap={8}>
          <ProcessNodeIconContainer>
            <ProcessNodeIcon type={PROCESS_ICON[data.processType]} />
          </ProcessNodeIconContainer>
          <Flex direction="column" gap={2}>
            <ProcessNodeTitle level={3}>
              {t(`component-title-${data.processType}`, {
                postProcess: 'uppercase',
              })}
            </ProcessNodeTitle>
            <div>{data.processDescription}</div>
          </Flex>
        </Flex>
      </ProcessNodeContent>
      {!hasSource && (
        <AddButtonLeftContainer
          className="nodrag"
          $isDropdownVisible={isLeftDropdownVisible}
        >
          <Dropdown
            content={
              <Menu>
                <Menu.Item
                  icon="Code"
                  onClick={() => handleAddNode('transformation', 'left')}
                >
                  Transformation
                </Menu.Item>
                <Menu.Item
                  icon="FrameTool"
                  onClick={() => handleAddNode('webhook', 'left')}
                >
                  Webhook
                </Menu.Item>
                <Menu.Item
                  icon="Pipeline"
                  onClick={() => handleAddNode('workflow', 'left')}
                >
                  Workflow
                </Menu.Item>
              </Menu>
            }
            onClickOutside={() => {
              setIsLeftDropdownVisible(false);
            }}
            placement="bottom-end"
            visible={isLeftDropdownVisible}
          >
            <Button
              onClick={() =>
                setIsLeftDropdownVisible((prevState) => !prevState)
              }
              type="primary"
              icon="AddLarge"
              size="small"
            />
          </Dropdown>
        </AddButtonLeftContainer>
      )}
      {!hasTarget && (
        <AddButtonRightContainer
          className="nodrag"
          $isDropdownVisible={isRightDropdownVisible}
        >
          <Dropdown
            content={
              <Menu>
                <Menu.Item
                  icon="Code"
                  onClick={() => handleAddNode('transformation', 'right')}
                >
                  Transformation
                </Menu.Item>
                <Menu.Item
                  icon="FrameTool"
                  onClick={() => handleAddNode('webhook', 'right')}
                >
                  Webhook
                </Menu.Item>
                <Menu.Item
                  icon="Pipeline"
                  onClick={() => handleAddNode('workflow', 'right')}
                >
                  Workflow
                </Menu.Item>
              </Menu>
            }
            onClickOutside={() => {
              setIsRightDropdownVisible(false);
            }}
            visible={isRightDropdownVisible}
          >
            <Button
              onClick={() =>
                setIsRightDropdownVisible((prevState) => !prevState)
              }
              type="primary"
              icon="AddLarge"
              size="small"
            />
          </Dropdown>
        </AddButtonRightContainer>
      )}
    </ProcessNodeContainer>
  );
};

const AddButtonBase = styled.button<{ $isDropdownVisible?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  box-shadow: none;
  border: none;
  padding: 0;
  cursor: pointer;
  position: absolute;
  z-index: 5000;
  top: 13px;
  background-color: ${Colors['border--interactive--toggled-default']};
  color: ${Colors['text-icon--strong--inverted']};
  opacity: ${({ $isDropdownVisible }) => ($isDropdownVisible ? 1 : 0)};

  :hover {
    opacity: 1;
  }

  :active {
    background-color: ${Colors['border--interactive--toggled-hover']};
  }
`;

const AddButtonLeftContainer = styled(AddButtonBase)`
  left: -36px;
`;

const AddButtonRightContainer = styled(AddButtonBase)`
  right: -36px;
`;

const BaseHandle = styled(Handle)`
  background-color: white;
  border: none;
  height: ${BASE_NODE_HANDLE_SIZE}px;
  width: ${BASE_NODE_HANDLE_SIZE / 2}px;
  right: ${(BASE_NODE_HANDLE_SIZE / 2) * -1}px;
  right: 0px;
  opacity: 0;
  z-index: 1;

  ::after {
    content: '';
    background-color: ${Colors['border--interactive--toggled-default']};
    border-radius: ${BASE_NODE_HANDLE_SIZE / 4}px;
    top: ${BASE_NODE_HANDLE_SIZE / 4}px;
    position: absolute;
    width: ${BASE_NODE_HANDLE_SIZE / 2}px;
    height: ${BASE_NODE_HANDLE_SIZE / 2}px;
  }

  :hover::after {
    background-color: ${Colors['border--interactive--toggled-hover']};
  }
`;

const BaseHandleRight = styled(BaseHandle)`
  border-radius: 2px 0 0 2px;
  right: 0px;

  ::after {
    left: ${BASE_NODE_HANDLE_SIZE / 4}px;
  }
`;

const BaseHandleLeft = styled(BaseHandle)`
  border-radius: 0 2px 2px 0;
  left: 0px;

  ::after {
    right: ${BASE_NODE_HANDLE_SIZE / 4}px;
  }
`;

const ProcessNodeContent = styled.div`
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 8px;

  :hover {
    outline: ${Colors['surface--interactive--toggled-default']} solid 4px;

    ${BaseHandleRight}, ${BaseHandleLeft} {
      opacity: 1;
    }
  }
`;

const ProcessNodeContainer = styled.div`
  background-color: ${Colors['surface--muted']};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--interactive']};
  display: flex;
  flex-direction: column;
  width: 300px;

  &.workflow-builder-node-selected {
    ${ProcessNodeContent} {
      outline: ${Colors['surface--interactive--toggled-default']} solid 4px;
      border-color: ${Colors['border--interactive--toggled-default']};
    }

    ${BaseHandleRight}, ${BaseHandleLeft} {
      opacity: 1;
    }
  }
`;

const ProcessNodeIconContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--interactive--toggled-default']};
  border-radius: 4px;
  display: flex;
  height: 36px;
  justify-content: center;
  width: 36px;
`;

const ProcessNodeIcon = styled(Icon)`
  color: ${Colors['text-icon--interactive--default']};
`;

const ProcessNodeTitle = styled(Overline)`
  color: ${Colors['text-icon--interactive--default']};
`;
