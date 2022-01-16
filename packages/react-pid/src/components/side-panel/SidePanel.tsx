import styled from 'styled-components';
import { Button, ToolBar, ToolBarButton } from '@cognite/cogs.js';
import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
} from '@cognite/pid-tools';

import { ToolType } from '../../types';
import { SaveSymbolData } from '../../ReactPid';

import { CollapsableInstanceList } from './CollapsableInstanceList';
import { FileController } from './FileController';
import { AddSymbolController } from './AddSymbolController';
import { AddLineNumberController } from './AddLineNumberController';

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
  active: ToolType;
  symbols: DiagramSymbol[];
  lines: DiagramLineInstance[];
  symbolInstances: DiagramSymbolInstance[];
  selection: SVGElement[];
  setActive: (arg0: ToolType) => void;
  loadSymbolsAsJson: (args0: string) => void;
  saveSymbol: (options: SaveSymbolData, selection: SVGElement[]) => void;
  deleteSymbol: (symbol: DiagramSymbol) => void;
  deleteConnection: (connection: DiagramConnection) => void;
  connections: DiagramConnection[];
  fileUrl?: string;
  findLinesAndConnections: () => void;
  saveGraphAsJson: () => void;
  lineNumbers: string[];
  setLineNumbers: (arg: string[]) => void;
  activeLineNumber: string | null;
  setActiveLineNumber: (arg: string | null) => void;
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
  deleteSymbol,
  deleteConnection,
  connections,
  fileUrl,
  findLinesAndConnections,
  saveGraphAsJson,
  lineNumbers,
  setLineNumbers,
  activeLineNumber,
  setActiveLineNumber,
}: SidePanelProps) => {
  const ActionWithCustomStyling: ToolBarButton[][] = [
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
        icon: 'String',
        onClick: () => setActive('setLineNumber'),
        className: `${active === 'setLineNumber' && 'active'}`,
        description: 'Set line number',
      },
    ],
  ];

  return (
    <SidePanelWrapper>
      <FileController
        disabled={fileUrl === ''}
        symbols={symbols}
        symbolInstances={symbolInstances}
        lineInstances={lines}
        loadSymbolsAsJson={loadSymbolsAsJson}
        saveGraphAsJson={saveGraphAsJson}
      />
      <CollapsableInstanceList
        symbols={symbols}
        symbolInstances={symbolInstances}
        lineInstances={lines}
        deleteSymbol={deleteSymbol}
        deleteConnection={deleteConnection}
        connections={connections}
      />
      <Button onClick={findLinesAndConnections}> Auto Analysis</Button>

      <div>
        {active === 'addSymbol' && (
          <AddSymbolController selection={selection} saveSymbol={saveSymbol} />
        )}
        {active === 'setLineNumber' && (
          <AddLineNumberController
            lineNumbers={lineNumbers}
            setLineNumbers={setLineNumbers}
            activeLineNumber={activeLineNumber}
            setActiveLineNumber={setActiveLineNumber}
          />
        )}

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
