import styled from 'styled-components';
import { ToolBar, ToolBarButton } from '@cognite/cogs.js';
import { ToolType, DiagramType } from '@cognite/pid-tools';

const ToolBarWrapper = styled.div`
  position: absolute;
  bottom: 22px;
  left: 6px;
  .active,
  :hover {
    background-color: var(--cogs-bg-control--disabled);
  }
  .active {
    opacity: 0.8ss;
    pointer-events: none;
  }
  .toolbar {
    background-color: rgba(255, 255, 255, 0.95);

    span {
      padding: 2px;
    }

    button {
      padding: 5px 10px;
      height: 30px;
    }
  }
`;

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  diagramType: DiagramType;
}

export const Toolbar = ({
  activeTool,
  setActiveTool,
  diagramType,
}: ToolbarProps) => {
  const toolBarButtonGroups: ToolBarButton[][] = [
    [
      {
        icon: 'Add',
        onClick: () => setActiveTool('addSymbol'),
        className: `${activeTool === 'addSymbol' && 'active'}`,
        description: 'Add symbol',
      },
      {
        icon: 'VectorLine',
        onClick: () => setActiveTool('addLine'),
        className: `${activeTool === 'addLine' && 'active'}`,
        description: 'Add line',
      },
      {
        icon: 'Split',
        onClick: () => setActiveTool('connectInstances'),
        className: `${activeTool === 'connectInstances' && 'active'}`,
        description: 'Connect instances',
      },
      {
        icon: 'Flag',
        onClick: () => setActiveTool('connectLabels'),
        className: `${activeTool === 'connectLabels' && 'active'}`,
        description: 'Connect labels',
      },
      {
        icon: 'String',
        onClick: () => setActiveTool('addEquipmentTag'),
        className: `${activeTool === 'addEquipmentTag' && 'active'}`,
        description: 'Add equipment tag',
      },
    ],
  ];

  if (diagramType === DiagramType.PID) {
    toolBarButtonGroups[0].push({
      icon: 'Number',
      onClick: () => setActiveTool('setLineNumber'),
      className: `${activeTool === 'setLineNumber' && 'active'}`,
      description: 'Set line number',
    });

    toolBarButtonGroups[0].push({
      icon: 'Slice',
      onClick: () => setActiveTool('splitLine'),
      className: `${activeTool === 'splitLine' && 'active'}`,
      description: 'Split line',
    });
  }

  return (
    <ToolBarWrapper>
      <ToolBar
        direction="vertical"
        buttonGroups={toolBarButtonGroups}
        className="toolbar"
      />
    </ToolBarWrapper>
  );
};
