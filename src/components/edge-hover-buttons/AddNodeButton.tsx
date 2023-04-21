import { Button, Menu, Dropdown } from '@cognite/cogs.js';
import { ProcessNode, ProcessType } from 'types';
import { Extend as AutomergeExtend, uuid } from '@automerge/automerge';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { useState } from 'react';
import { Edge } from 'reactflow';

type Props = {
  className: string;
  xPos: number;
  yPos: number;
  id: string;
};

const AddNodeButton = ({ className, id, xPos, yPos }: Props) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  //console.log('isDropdownVisible: ', isDropdownVisible);

  const { changeEdges, changeNodes } = useWorkflowBuilderContext();

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
        processProps: {},
      },
    };
    // FIXME: any
    const leftEdge: AutomergeExtend<Edge<any>> = {
      id: uuid(),
      source: node.id,
      target: id,
      type: 'default',
    };
    const rightEdge: AutomergeExtend<Edge<any>> = {
      id: uuid(),
      source: id,
      target: node.id,
      type: 'default',
    };
    const newEdges = [leftEdge, rightEdge];

    changeNodes((nodes) => {
      nodes.push(node);
    });
    changeEdges((edges) => {
      edges.push(...newEdges);
    });
  };

  return (
    <Dropdown
      content={
        <Menu>
          <Menu.Item
            icon="Code"
            onClick={() => handleAddNode('transformation', xPos, yPos)}
          >
            Transformation
          </Menu.Item>
          <Menu.Item
            icon="FrameTool"
            onClick={() => handleAddNode('webhook', xPos, yPos)}
          >
            Webhook
          </Menu.Item>
          <Menu.Item
            icon="Pipeline"
            onClick={() => handleAddNode('workflow', xPos, yPos)}
          >
            Workflow
          </Menu.Item>
        </Menu>
      }
      placement="bottom-end"
      visible={isDropdownVisible}
    >
      <Button
        onClick={() => setIsDropdownVisible((prevState) => !prevState)}
        type="primary"
        icon="AddLarge"
        className={className}
        size="small"
      />
    </Dropdown>
  );
};

export default AddNodeButton;
