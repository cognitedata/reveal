import styled from 'styled-components';
import { ToolBar, ToolBarButton } from '@cognite/cogs.js';
import { DocumentType } from '@cognite/pid-tools';

import { ToolType } from '../../types';

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
  active: ToolType;
  setActive: (arg0: ToolType) => void;
  documentType: DocumentType;
}

export const Toolbar = ({ active, setActive, documentType }: ToolbarProps) => {
  const toolBarButtonGroups: ToolBarButton[][] = [
    [
      {
        icon: 'Add',
        onClick: () => setActive('addSymbol'),
        className: `${active === 'addSymbol' && 'active'}`,
        description: 'Add symbol',
      },
      {
        icon: 'VectorLine',
        onClick: () => setActive('addLine'),
        className: `${active === 'addLine' && 'active'}`,
        description: 'Add line',
      },
      {
        icon: 'Split',
        onClick: () => setActive('connectInstances'),
        className: `${active === 'connectInstances' && 'active'}`,
        description: 'Connect instances',
      },
      {
        icon: 'Flag',
        onClick: () => setActive('connectLabels'),
        className: `${active === 'connectLabels' && 'active'}`,
        description: 'Connect labels',
      },
      {
        icon: 'GraphTree',
        onClick: () => setActive('graphExplorer'),
        className: `${active === 'graphExplorer' && 'active'}`,
        description: 'Explore the wast graph universe',
      },
      {
        icon: 'Number',
        onClick: () => setActive('setLineNumber'),
        className: `${active === 'setLineNumber' && 'active'}`,
        description: 'Set line number',
      },
    ],
  ];

  if (documentType === DocumentType.pid) {
    toolBarButtonGroups[0].push({
      icon: 'Slice',
      onClick: () => setActive('splitLine'),
      className: `${active === 'splitLine' && 'active'}`,
      description: 'Split line',
    });
  } else if (documentType === DocumentType.isometric) {
    toolBarButtonGroups[0].push({
      icon: 'String',
      onClick: () => setActive('addEquipmentTag'),
      className: `${active === 'addEquipmentTag' && 'active'}`,
      description: 'Add equipment tag',
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
