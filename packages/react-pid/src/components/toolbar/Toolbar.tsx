import styled from 'styled-components';
import { ToolBar, ToolBarButton } from '@cognite/cogs.js';
import { DocumentType } from '@cognite/pid-tools';

import { ToolType } from '../../types';

const ToolBarWrapper = styled.div`
  position: absolute;
  bottom: 25px;
  left: 10px;
  .active {
    background-color: var(--cogs-btn-color-primary);
    color: white;
    &:hover {
      background-color: var(--cogs-btn-color-primary);
      color: white;
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
      {
        icon: 'String',
        onClick: () => setActive('addEquipmentTag'),
        className: `${active === 'addEquipmentTag' && 'active'}`,
        description: 'Add equipment tag',
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
  }

  return (
    <ToolBarWrapper>
      <ToolBar direction="vertical" buttonGroups={toolBarButtonGroups} />
    </ToolBarWrapper>
  );
};
