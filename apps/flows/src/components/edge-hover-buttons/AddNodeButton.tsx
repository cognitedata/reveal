import { Edge } from 'reactflow';

import { Extend as AutomergeExtend, uuid } from '@automerge/automerge';
import { useTranslation } from '@flows/common';
import { useWorkflowBuilderContext } from '@flows/contexts/WorkflowContext';
import { ProcessNode, ProcessType } from '@flows/types';
import { useUserInfo } from '@flows/utils/user';
import { Dropdown, Space } from 'antd';

import { Button, Menu } from '@cognite/cogs.js';

type Props = {
  className: string;
  xPos: number;
  yPos: number;
  id: string;
  source: string;
  target: string;
  visibleAddButton: boolean;
  setVisibleAddButton: (visible: boolean) => void;
};

const AddNodeButton = ({
  className,
  id,
  xPos,
  yPos,
  source,
  target,
  visibleAddButton,
  setVisibleAddButton,
}: Props) => {
  const { t } = useTranslation();
  const { changeEdges, changeNodes } = useWorkflowBuilderContext();
  const { data: userInfo } = useUserInfo();

  const handleAddNode = (
    processType: ProcessType,
    xPos: number,
    yPos: number
  ): void => {
    const node: AutomergeExtend<ProcessNode> = {
      id: uuid(),
      type: 'process',
      position: {
        x: xPos,
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
    const leftEdge: AutomergeExtend<Edge<any>> = {
      id: uuid(),
      source: source,
      target: node.id,
      type: 'customEdge',
    };
    const rightEdge: AutomergeExtend<Edge<any>> = {
      id: uuid(),
      source: node.id,
      target: target,
      type: 'customEdge',
    };
    const newEdges = [leftEdge, rightEdge];

    changeNodes((nodes) => {
      nodes.push(node);
    });
    changeEdges(
      (edges) => {
        edges.push(...newEdges);
        const i = edges.findIndex((e) => e.id === id);
        edges.deleteAt(i);
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
    <Space>
      <Dropdown
        trigger={['click']}
        dropdownRender={() => (
          <Menu>
            <Menu.Item
              icon="Code"
              onClick={() => handleAddNode('transformation', xPos, yPos)}
            >
              {t('transformation')}
            </Menu.Item>
            <Menu.Item
              icon="Function"
              onClick={() => handleAddNode('function', xPos, yPos)}
            >
              {t('function')}
            </Menu.Item>
          </Menu>
        )}
      >
        <Button
          aria-label="Add new node"
          onClick={() => setVisibleAddButton(!visibleAddButton)}
          type="primary"
          icon="AddLarge"
          className={className}
          size="small"
        />
      </Dropdown>
    </Space>
  );
};

export default AddNodeButton;
