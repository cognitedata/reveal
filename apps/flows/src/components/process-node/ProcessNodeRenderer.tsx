import { useState } from 'react';
import { Edge, Handle, NodeProps, Position } from 'reactflow';

import styled from 'styled-components';

import { Extend as AutomergeExtend, uuid } from '@automerge/automerge';
import { useTranslation } from '@flows/common';
import {
  UserState,
  useWorkflowBuilderContext,
} from '@flows/contexts/WorkflowContext';
import {
  PROCESS_ICON,
  ProcessNode,
  ProcessNodeData,
  ProcessType,
} from '@flows/types';
import { useUserInfo } from '@flows/utils/user';

import {
  Body,
  Button,
  Colors,
  Dropdown,
  Elevations,
  Flex,
  Icon,
  Menu,
  Overline,
} from '@cognite/cogs.js';

const BASE_NODE_HANDLE_SIZE = 16;

const getFocusedUserNames = (
  otherUsers: UserState[],
  isSelectedByCurrentUser: boolean
): string => {
  const names = isSelectedByCurrentUser ? ['You'] : [];
  otherUsers.forEach(({ name, connectionId }) => {
    const identifier = name ?? connectionId;
    if (!names.includes(identifier)) {
      names.push(identifier);
    }
  });

  return names.join(', ');
};

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
  const { data: userInfo } = useUserInfo();
  const { changeEdges, changeNodes, edges, otherUserStates } =
    useWorkflowBuilderContext();

  const otherUsers = otherUserStates.filter(({ selectedObjectIds }) =>
    selectedObjectIds.includes(id)
  );

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
        processExternalId: '',
        processProps: {},
      },
    };

    // FIXME: any
    const edge: AutomergeExtend<Edge<any>> = {
      id: uuid(),
      source: direction === 'left' ? node.id : id,
      target: direction === 'left' ? id : node.id,
      type: 'customEdge',
    };

    changeNodes((nodes) => {
      nodes.push(node);
    });
    changeEdges(
      (edges) => {
        edges.push(edge);
      },
      () => ({
        time: Date.now(),
        message: JSON.stringify({
          message: `${node.data.processType} added`,
          user: userInfo?.displayName,
        }),
      })
    );
  };

  return (
    <ProcessNodeContainer
      className={[
        selected ? 'workflow-builder-node-selected' : undefined,
        otherUsers.length > 0
          ? 'workflow-builder-node-other-user-selected'
          : undefined,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ProcessNodeContent>
        <BaseHandleLeft position={Position.Left} type="target" />
        <BaseHandleRight position={Position.Right} type="source" />
        <Flex gap={8}>
          <ProcessNodeIconContainer>
            <ProcessNodeIcon type={PROCESS_ICON[data.processType]} />
          </ProcessNodeIconContainer>
          <Flex direction="column">
            <ProcessNodeTitle level={3}>
              {t(`component-title-${data.processType}`, {
                postProcess: 'uppercase',
              })}
            </ProcessNodeTitle>
            {data.processExternalId ? (
              <Body level={3}>{data.processExternalId}</Body>
            ) : (
              <Body level={3} muted>
                {t('not-set')}
              </Body>
            )}
          </Flex>
        </Flex>
        {otherUsers.length > 0 && (
          <FocusedUsers>
            {getFocusedUserNames(otherUsers, selected)}
          </FocusedUsers>
        )}
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
                  {t('transformation')}
                </Menu.Item>
                <Menu.Item
                  icon="Function"
                  onClick={() => handleAddNode('function', 'left')}
                >
                  {t('function')}
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
              aria-label="Add source to node"
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
                  {t('transformation')}
                </Menu.Item>
                <Menu.Item
                  icon="Function"
                  onClick={() => handleAddNode('function', 'right')}
                >
                  {t('function')}
                </Menu.Item>
              </Menu>
            }
            onClickOutside={() => {
              setIsRightDropdownVisible(false);
            }}
            visible={isRightDropdownVisible}
          >
            <Button
              aria-label="Add target to node"
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

  &.workflow-builder-node-other-user-selected {
    ${ProcessNodeContent} {
      border-color: ${Colors['decorative--pink--400']};
    }

    ${BaseHandleRight}, ${BaseHandleLeft} {
      opacity: 1;

      ::after {
        background-color: ${Colors['decorative--pink--400']};
      }

      :hover::after {
        background-color: ${Colors['decorative--pink--500']};
      }
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

const FocusedUsers = styled(Body).attrs({ level: 3, strong: true })`
  background-color: ${Colors['decorative--pink--400']};
  color: ${Colors['text-icon--strong--inverted']};
  border-radius: 2px;
  height: 20px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  position: absolute;
  right: 0;
  top: -24px;
`;
