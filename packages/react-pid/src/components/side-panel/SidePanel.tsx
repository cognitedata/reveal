import styled from 'styled-components';
import { ToolBar, ToolBarButton } from '@cognite/cogs.js';
import {
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
} from '@cognite/pid-tools';

import { CollapsableInstanceList } from './CollapsableInstanceList';
import { FileController } from './FileController';
import { AddSymbolController } from './AddSymbolController';

const SidePanelWrapper = styled.div`
  display: grid;
  grid-template-rows: max-content auto max-content;
  height: 100%;
`;

const ToolBarWrapper = styled.div`
  padding: 40px;
  .active {
    background-color: var(--cogs-btn-color-primary);
    color: white;
    &:hover {
      background-color: var(--cogs-btn-color-primary);
      color: white;
    }
  }
`;

interface SidePanelProps {
  active: string;
  symbols: DiagramSymbol[];
  lines: DiagramLineInstance[];
  symbolInstances: DiagramSymbolInstance[];
  selection: SVGElement[];
  setActive: (arg0: string) => void;
  loadSymbolsAsJson: (args0: string) => void;
  saveSymbol: (symbolName: string, selection: SVGElement[]) => void;
}

export const SidePanel = ({
  active,
  symbols,
  lines,
  symbolInstances,
  selection,
  setActive,
  loadSymbolsAsJson,
  saveSymbol,
}: SidePanelProps) => {
  const ActionWithCustomStyling: ToolBarButton[][] = [
    [
      {
        icon: 'PlusCompact',
        onClick: () =>
          active === 'AddSymbol' ? setActive('') : setActive('AddSymbol'),
        className: `${active === 'AddSymbol' && 'active'}`,
        description: 'Add symbol',
      },
      {
        icon: 'VectorLine',
        onClick: () =>
          active === 'AddLine' ? setActive('') : setActive('AddLine'),
        className: `${active === 'AddLine' && 'active'}`,
        description: 'Add line',
      },
    ],
  ];

  return (
    <SidePanelWrapper>
      <FileController
        symbols={symbols}
        symbolInstances={symbolInstances}
        lineInstances={lines}
        loadSymbolsAsJson={loadSymbolsAsJson}
      />
      <CollapsableInstanceList
        symbols={symbols}
        symbolInstances={symbolInstances}
        lineInstances={lines}
      />
      <div>
        {active === 'AddSymbol' &&
          AddSymbolController({ selection, saveSymbol })}

        <ToolBarWrapper>
          <ToolBar
            direction="horizontal"
            buttonGroups={ActionWithCustomStyling}
          />
        </ToolBarWrapper>
      </div>
    </SidePanelWrapper>
  );
};
