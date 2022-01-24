import styled from 'styled-components';
import { Button, ToolBar, ToolBarButton } from '@cognite/cogs.js';
import {
  DiagramConnection,
  DiagramEquipmentTagInstance,
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
  DocumentType,
  PidDocumentWithDom,
} from '@cognite/pid-tools';

import { ToolType } from '../../types';
import { SaveSymbolData } from '../../ReactPid';

import { CollapsableInstanceList } from './CollapsableInstanceList';
import { FileController } from './FileController';
import { AddSymbolController } from './AddSymbolController';
import { DocumentTypeSelector } from './DocumentTypeSelector';
import { AddLineNumberController } from './AddLineNumberController';

const SidePanelWrapper = styled.div`
  display: grid;
  grid-template-rows: max-content auto max-content;
  height: 100%;
  position: relative;
`;

const ToolBarWrapper = styled.div`
  margin: 40px auto;
  width: fit-content;
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
  getPidDocument: () => PidDocumentWithDom | undefined;
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
  documentType: DocumentType;
  setDocumentType: (type: DocumentType) => void;
  lineNumbers: string[];
  setLineNumbers: (arg: string[]) => void;
  activeLineNumber: string | null;
  setActiveLineNumber: (arg: string | null) => void;
  equipmentTags: DiagramEquipmentTagInstance[];
  setEquipmentTags: (arg: DiagramEquipmentTagInstance[]) => void;
  activeTagName: string | undefined;
  setActiveTagName: (arg: string | undefined) => void;
}

export const SidePanel = ({
  getPidDocument,
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
  documentType,
  setDocumentType,
  lineNumbers,
  setLineNumbers,
  activeLineNumber,
  setActiveLineNumber,
  equipmentTags,
  setEquipmentTags,
  activeTagName,
  setActiveTagName,
}: SidePanelProps) => {
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

  const FileControllerWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    & > span {
      margin: 0 auto;
    }
  `;

  const setActiveTagWrapper = (arg: string | undefined) => {
    setActive('addEquipmentTag');
    setActiveTagName(arg);
  };

  return (
    <SidePanelWrapper>
      <FileControllerWrapper>
        <FileController
          disabled={fileUrl === ''}
          symbols={symbols}
          symbolInstances={symbolInstances}
          lineInstances={lines}
          loadSymbolsAsJson={loadSymbolsAsJson}
          saveGraphAsJson={saveGraphAsJson}
          getPidDocument={getPidDocument}
        />
        {documentType !== DocumentType.unknown && (
          <span>Document type: {documentType}</span>
        )}
      </FileControllerWrapper>
      <CollapsableInstanceList
        symbols={symbols}
        symbolInstances={symbolInstances}
        lineInstances={lines}
        deleteSymbol={deleteSymbol}
        deleteConnection={deleteConnection}
        connections={connections}
        equipmentTags={equipmentTags}
        setEquipmentTags={setEquipmentTags}
        activeTagName={activeTagName}
        setActiveTagName={setActiveTagWrapper}
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
          <ToolBar direction="vertical" buttonGroups={toolBarButtonGroups} />
        </ToolBarWrapper>
      </div>
      {active === 'selectDocumentType' && fileUrl !== '' && (
        <DocumentTypeSelector setDocumentType={setDocumentType} />
      )}
    </SidePanelWrapper>
  );
};
